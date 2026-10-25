const env = require('../config/env');
const { findState, stateMatches, normPlace } = require('../data/indiaStates');
const { describeCode, compass, buildAlerts, buildFarmAdvice } = require('./weatherAlerts.service');

const cfg = env.weather;
const MAX_CACHE_ENTRIES = 500;

class WeatherError extends Error {
  constructor(status, message, code, retryable = false) {
    super(message);
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

// ── tiny TTL caches (in-memory, per server process) ──────────────────────────────
const forecastCache = new Map();
const geoCache = new Map();
const inflight = new Map();

const cacheGet = (map, key) => {
  const hit = map.get(key);
  if (!hit) return null;
  if (hit.expires < Date.now()) { map.delete(key); return null; }
  return hit.value;
};
const cacheSet = (map, key, value, ttl) => {
  if (map.size >= MAX_CACHE_ENTRIES) map.delete(map.keys().next().value); // drop oldest
  map.set(key, { value, expires: Date.now() + ttl });
};
const clearCaches = () => { forecastCache.clear(); geoCache.clear(); inflight.clear(); };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── HTTP: timeout + one retry on network errors / 5xx. Never leaks the URL (it may carry an API key). ──
const attempt = async (url) => {
  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(cfg.timeoutMs), headers: { Accept: 'application/json' } });
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new WeatherError(504, 'The weather service took too long to respond. Please try again.', 'UPSTREAM_TIMEOUT', true);
    }
    throw new WeatherError(502, 'Could not reach the weather service. Please try again shortly.', 'UPSTREAM_UNREACHABLE', true);
  }
  if (res.status === 429) throw new WeatherError(503, 'The weather service is busy right now. Please try again in a minute.', 'UPSTREAM_RATE_LIMIT');
  if (res.status >= 500) throw new WeatherError(502, 'The weather service is having problems. Please try again shortly.', 'UPSTREAM_ERROR', true);
  if (!res.ok) throw new WeatherError(502, 'The weather service could not process this request.', 'UPSTREAM_REJECTED');
  try {
    return await res.json();
  } catch {
    throw new WeatherError(502, 'The weather service sent an unreadable response.', 'UPSTREAM_BAD_RESPONSE');
  }
};

const getJson = async (baseUrl, params) => {
  const qs = new URLSearchParams(params);
  if (cfg.apiKey) qs.set('apikey', cfg.apiKey);
  const url = `${baseUrl}?${qs.toString()}`;
  try {
    return await attempt(url);
  } catch (err) {
    if (!err.retryable) throw err;
    await sleep(cfg.retryDelayMs);
    return attempt(url);
  }
};

// ── Geocoding ────────────────────────────────────────────────────────────────────
const geocode = async (name, count = 20) => {
  const data = await getJson(cfg.geocodingUrl, { name, count: String(count), language: 'en', format: 'json', countryCode: 'IN' });
  return Array.isArray(data?.results) ? data.results : [];
};

const scorePlace = (r, wanted) => {
  let s = 0;
  if (normPlace(r.admin2) === wanted) s += 3;
  if (normPlace(r.name) === wanted) s += 2;
  if (/^PPLA|^PPLC/.test(r.feature_code || '')) s += 2; // administrative seat
  return s;
};

/** Resolve "district, state" → coordinates. Falls back to the state capital (precise:false). */
const resolveLocation = async (stateName, district) => {
  const state = findState(stateName);
  if (!state) throw new WeatherError(400, 'Please choose a valid Indian state or union territory.', 'BAD_STATE');

  const key = `${state.name}|${normPlace(district)}`;
  const cached = cacheGet(geoCache, key);
  if (cached) return cached;

  const results = await geocode(district);
  const inState = results.filter((r) => stateMatches(r.admin1, state) && Number.isFinite(r.latitude) && Number.isFinite(r.longitude));
  const wanted = normPlace(district);

  let location;
  if (inState.length) {
    inState.sort((a, b) => scorePlace(b, wanted) - scorePlace(a, wanted) || (b.population || 0) - (a.population || 0));
    const best = inState[0];
    location = { state: state.name, district, latitude: best.latitude, longitude: best.longitude, elevation: best.elevation ?? null, matchedName: best.name, precise: true };
  } else {
    location = { state: state.name, district, latitude: state.lat, longitude: state.lon, elevation: null, matchedName: null, precise: false };
  }
  cacheSet(geoCache, key, location, cfg.geoCacheTtlMs);
  return location;
};

/** Autocomplete: places in India (optionally limited to one state) matching `q`. */
const suggestPlaces = async (q, stateName) => {
  const state = stateName ? findState(stateName) : null;
  if (stateName && !state) throw new WeatherError(400, 'Please choose a valid Indian state or union territory.', 'BAD_STATE');

  const results = await geocode(q, 30);
  const seen = new Set();
  const out = [];
  for (const r of results) {
    if (!Number.isFinite(r.latitude) || !Number.isFinite(r.longitude)) continue;
    const st = findState(r.admin1);
    if (!st || (state && st.name !== state.name)) continue;
    const district = (r.admin2 || '').replace(/\s+district$/i, '').trim();
    const key = `${st.name}|${normPlace(r.name)}|${normPlace(district)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name: r.name, district: district || r.name, state: st.name, latitude: r.latitude, longitude: r.longitude });
    if (out.length >= 8) break;
  }
  return out;
};

// ── Forecast ─────────────────────────────────────────────────────────────────────
const round = (v, d = 0) => (Number.isFinite(v) ? Math.round(v * 10 ** d) / 10 ** d : null);

/** Validate + reshape the provider payload. Throws WeatherError(502) if it isn't what we expect. */
const normalizeForecast = (raw) => {
  const bad = () => new WeatherError(502, 'The weather service sent unexpected data.', 'UPSTREAM_BAD_RESPONSE');
  const c = raw?.current, d = raw?.daily, h = raw?.hourly;
  if (!c || !d || !Array.isArray(d.time) || !d.time.length) throw bad();
  for (const k of ['weather_code', 'temperature_2m_max', 'temperature_2m_min', 'precipitation_sum', 'wind_speed_10m_max']) {
    if (!Array.isArray(d[k]) || d[k].length !== d.time.length) throw bad();
  }

  // daily mean humidity from the hourly series
  const hum = {};
  if (Array.isArray(h?.time) && Array.isArray(h?.relative_humidity_2m)) {
    h.time.forEach((t, i) => {
      const v = h.relative_humidity_2m[i];
      if (!Number.isFinite(v)) return;
      const day = String(t).slice(0, 10);
      (hum[day] ||= []).push(v);
    });
  }
  const mean = (a) => (a && a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);

  const forecast = d.time.map((date, i) => ({
    date,
    tempMax: round(d.temperature_2m_max[i], 1),
    tempMin: round(d.temperature_2m_min[i], 1),
    rainfall: round(d.precipitation_sum[i], 1) ?? 0,
    rainChance: round(d.precipitation_probability_max?.[i]),
    humidity: round(mean(hum[date])),
    windSpeed: round(d.wind_speed_10m_max[i]),
    windGusts: round(d.wind_gusts_10m_max?.[i]),
    condition: describeCode(d.weather_code[i]),
  }));

  const current = {
    time: c.time,
    temperature: round(c.temperature_2m, 1),
    feelsLike: round(c.apparent_temperature, 1),
    humidity: round(c.relative_humidity_2m),
    precipitation: round(c.precipitation, 1) ?? 0,
    windSpeed: round(c.wind_speed_10m),
    windGusts: round(c.wind_gusts_10m),
    windDirection: round(c.wind_direction_10m),
    windDirectionLabel: compass(c.wind_direction_10m),
    isDay: c.is_day === 1,
    condition: describeCode(c.weather_code),
  };
  return { current, forecast, elevation: raw.elevation ?? null, timezone: raw.timezone || 'Asia/Kolkata' };
};

const fetchForecast = async (lat, lon) => {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = cacheGet(forecastCache, key);
  if (cached) return { ...cached, cached: true };
  if (inflight.has(key)) return inflight.get(key); // de-duplicate concurrent identical requests

  const p = (async () => {
    const raw = await getJson(cfg.forecastUrl, {
      latitude: lat.toFixed(4),
      longitude: lon.toFixed(4),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max',
      hourly: 'relative_humidity_2m',
      timezone: 'Asia/Kolkata',
      forecast_days: '5',
      wind_speed_unit: 'kmh',
    });
    const data = { ...normalizeForecast(raw), fetchedAt: new Date().toISOString() };
    cacheSet(forecastCache, key, data, cfg.cacheTtlMs);
    return { ...data, cached: false };
  })().finally(() => inflight.delete(key));

  inflight.set(key, p);
  return p;
};

/**
 * Full weather report for a place.
 *  place = { state, district, latitude?, longitude? }  (coordinates optional — skips geocoding)
 */
const getWeatherReport = async (place) => {
  const state = findState(place.state);
  if (!state) throw new WeatherError(400, 'Please choose a valid Indian state or union territory.', 'BAD_STATE');

  const location = Number.isFinite(place.latitude) && Number.isFinite(place.longitude)
    ? { state: state.name, district: place.district, latitude: place.latitude, longitude: place.longitude, elevation: null, matchedName: null, precise: true }
    : await resolveLocation(place.state, place.district);

  const f = await fetchForecast(location.latitude, location.longitude);
  return {
    location: { ...location, elevation: f.elevation ?? location.elevation, timezone: f.timezone },
    current: f.current,
    forecast: f.forecast,
    alerts: buildAlerts(f.forecast),
    farmAdvice: buildFarmAdvice(f.forecast),
    fetchedAt: f.fetchedAt,
    cached: f.cached,
    provider: 'Open-Meteo',
  };
};

module.exports = { WeatherError, getWeatherReport, suggestPlaces, resolveLocation, fetchForecast, normalizeForecast, clearCaches };