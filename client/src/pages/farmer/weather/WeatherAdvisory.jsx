import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../../components/common/Loader';
import { getWeather, getWeatherStates, searchWeatherPlaces, updateProfile } from '../../../services/farmerService';

const SEVERITY = {
  severe:   { label: 'Severe',   icon: '🚨', color: '#B42318', bg: '#FDF2F1', border: '#F8CBC7' },
  warning:  { label: 'Warning',  icon: '⚠️', color: '#B54708', bg: '#FFF6E5', border: '#F6D58B' },
  advisory: { label: 'Advisory', icon: '🌾', color: '#8A6A00', bg: '#FEFBE8', border: '#EFE2A0' },
  info:     { label: 'Good to know', icon: '✅', color: '#1F7A4D', bg: '#EFF8F2', border: '#BFE3CD' },
};
const ADVICE_COLOR = { good: '#1F7A4D', normal: '#1F7A4D', caution: '#B54708', needed: '#B54708', skip: '#1D64B4', avoid: '#B42318' };
const SOURCE_LABEL = { profile: 'Your profile location', farm: 'From your farm', search: 'Searched location' };

const parseDate = (d) => new Date(`${d}T00:00:00`);
const dayName = (d, i) => (i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : parseDate(d).toLocaleDateString('en-IN', { weekday: 'short' }));
const shortDate = (d) => parseDate(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const dash = (v, unit = '') => (v === null || v === undefined ? '—' : `${v}${unit}`);
const errMsg = (err) =>
  err?.response?.data?.message || (err?.request ? 'Cannot reach the server. Check your internet connection.' : 'Something went wrong. Please try again.');

const card = { background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem' };

/* ───────────── Location picker: state + district search ───────────── */
const LocationPicker = ({ states, initial, busy, onSubmit }) => {
  const [state, setState] = useState(initial.state || '');
  const [text, setText] = useState(initial.district || '');
  const [picked, setPicked] = useState(null); // a suggestion with coordinates
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const seq = useRef(0);
  const blurTimer = useRef(null);
  useEffect(() => () => clearTimeout(blurTimer.current), []);

  // keep inputs in sync when the shown location changes from outside (e.g. "back to my location")
  useEffect(() => { setState(initial.state || ''); setText(initial.district || ''); setPicked(null); }, [initial.state, initial.district]);

  // debounced autocomplete, restricted to the chosen state
  useEffect(() => {
    const q = text.trim();
    if (!open || q.length < 2 || picked) { setSuggestions([]); return undefined; }
    const my = ++seq.current;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchWeatherPlaces({ q, ...(state ? { state } : {}) });
        if (my === seq.current) setSuggestions(res.data.data.places);
      } catch {
        if (my === seq.current) setSuggestions([]);
      } finally {
        if (my === seq.current) setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [text, state, open, picked]);

  const choose = (p) => {
    setPicked(p); setText(p.name); setState(p.state); setSuggestions([]); setOpen(false);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!state || text.trim().length < 2) return;
    onSubmit(picked ? { state, district: picked.name, latitude: picked.latitude, longitude: picked.longitude } : { state, district: text.trim() });
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div style={{ flex: '1 1 190px' }}>
        <label className="form-label" htmlFor="wx-state">State / UT</label>
        <select id="wx-state" className="form-select" value={state} onChange={(e) => { setState(e.target.value); setPicked(null); }}>
          <option value="">Select state…</option>
          {states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ flex: '1 1 230px', position: 'relative' }}>
        <label className="form-label" htmlFor="wx-district">District / town</label>
        <input id="wx-district" className="form-input" value={text} autoComplete="off" maxLength={100} placeholder="Type a district or town…"
          onChange={(e) => { clearTimeout(blurTimer.current); setText(e.target.value); setPicked(null); setOpen(true); }}
          onFocus={() => { clearTimeout(blurTimer.current); setOpen(true); }}
          onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 150); }} />
        {open && (suggestions.length > 0 || searching) && (
          <ul role="listbox" aria-label="Place suggestions" style={{ position: 'absolute', zIndex: 20, left: 0, right: 0, top: '100%', margin: 0, padding: 4, listStyle: 'none', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 24px rgba(0,0,0,.12)', maxHeight: 260, overflowY: 'auto' }}>
            {searching && suggestions.length === 0 && <li style={{ padding: '0.5rem 0.7rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Searching…</li>}
            {suggestions.map((p) => (
              <li key={`${p.name}-${p.latitude}-${p.longitude}`} role="option">
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => choose(p)}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 0, padding: '0.5rem 0.7rem', cursor: 'pointer', borderRadius: 6, fontSize: '0.85rem' }}>
                  <strong>{p.name}</strong>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{p.district && p.district !== p.name ? `, ${p.district} district` : ''}, {p.state}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="submit" className="btn btn-primary" disabled={busy || !state || text.trim().length < 2} style={{ fontWeight: 700 }}>
        {busy ? 'Loading…' : '🔍 Get weather'}
      </button>
    </form>
  );
};

/* ───────────── Small presentational pieces ───────────── */
const Metric = ({ icon, label, value, sub }) => (
  <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '0.7rem 0.85rem' }}>
    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{icon} {label}</div>
    <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{value}</div>
    {sub && <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>{sub}</div>}
  </div>
);

const AlertItem = ({ alert }) => {
  const s = SEVERITY[alert.severity] || SEVERITY.advisory;
  const when = alert.dates.length >= 5 ? 'Next 5 days' : alert.dates.map(shortDate).join(', ');
  return (
    <div role="alert" data-testid="weather-alert" data-severity={alert.severity} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 'var(--radius-lg)', padding: '0.9rem 1.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'baseline' }}>
        <strong style={{ color: s.color }}>{s.icon} {alert.title}</strong>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: s.color }}>{s.label} · {when}</span>
      </div>
      <p style={{ margin: '0.35rem 0 0.25rem', fontSize: '0.87rem' }}>{alert.message}</p>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}><strong>What to do:</strong> {alert.advice}</p>
    </div>
  );
};

/* ───────────── Page ───────────── */
const WeatherAdvisory = () => {
  const [states, setStates] = useState([]);
  const [data, setData] = useState(null);          // last successful report
  const [needsLocation, setNeedsLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRequest, setLastRequest] = useState(null); // params of the last request, for Retry / Refresh
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const seq = useRef(0);

  // params === null → the farmer's default (profile → farm) location
  const load = useCallback(async (params) => {
    const my = ++seq.current;
    setLoading(true); setError(''); setLastRequest(params);
    try {
      const res = await getWeather(params ? { state: params.state, district: params.district, ...(params.latitude !== undefined ? { lat: params.latitude, lon: params.longitude } : {}) } : undefined);
      if (my !== seq.current) return; // a newer request superseded this one
      const d = res.data.data;
      if (d.needsLocation) { setNeedsLocation(true); setData(null); } else { setNeedsLocation(false); setData(d); }
    } catch (err) {
      if (my !== seq.current) return;
      setError(errMsg(err));
    } finally {
      if (my === seq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(null); // default location on every visit
    getWeatherStates().then((r) => setStates(r.data.data.states)).catch(() => {});
  }, [load]);

  const saveAsHome = async () => {
    setSaving(true); setNotice('');
    try {
      await updateProfile({ state: data.location.state, district: data.location.district });
      setData((d) => ({ ...d, defaultLocation: { state: d.location.state, district: d.location.district, source: 'profile' } }));
      setNotice(`${data.location.district}, ${data.location.state} is now your home location.`);
      setTimeout(() => setNotice(''), 4000);
    } catch (err) { setError(errMsg(err)); }
    finally { setSaving(false); }
  };

  const loc = data?.location;
  const def = data?.defaultLocation;
  const isDefaultShown = loc && def && loc.state === def.state && loc.district === def.district;
  const picker = <LocationPicker states={states} initial={{ state: loc?.state || def?.state || '', district: loc?.district || def?.district || '' }} busy={loading} onSubmit={load} />;

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.25rem' }}>🌤️ Weather Advisory</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', margin: 0 }}>
          Live weather, a 5-day forecast and farming alerts for any district in India.
        </p>
      </div>

      {notice && <div className="alert alert-success" role="status" style={{ marginBottom: '1rem' }}>✓ {notice}</div>}

      {/* Location bar */}
      <div style={{ ...card, marginBottom: '1.25rem' }}>
        {loc && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>📍 {loc.district}, {loc.state}</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: 4 }}>
                <span className="badge badge-green">{SOURCE_LABEL[loc.source] || 'Location'}{loc.source === 'farm' && def?.farmName ? `: ${def.farmName}` : ''}</span>
                {!loc.precise && <span className="badge badge-yellow">Approximate — showing the state capital area</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {!isDefaultShown && def && <button className="btn btn-secondary btn-sm" onClick={() => load(null)}>↩ My location</button>}
              {loc.source === 'search' && loc.precise && (!def || def.source !== 'profile' || !isDefaultShown) && (
                <button className="btn btn-outline btn-sm" onClick={saveAsHome} disabled={saving}>{saving ? 'Saving…' : '⭐ Set as my home location'}</button>
              )}
            </div>
          </div>
        )}
        {picker}
        {loc && def?.source !== 'profile' && (
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0.75rem 0 0' }}>
            💡 Save your home district in <Link to="/farmer/profile">your profile</Link> to open this page on your area every time.
          </p>
        )}
      </div>

      {error && (
        <div className="alert alert-error" role="alert" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
          <span>{error}</span>
          <button className="btn btn-sm btn-secondary" onClick={() => load(lastRequest)}>Try again</button>
        </div>
      )}

      {loading && !data && <Loader text="Fetching the latest weather…" />}

      {needsLocation && !loading && !error && (
        <div style={{ ...card, textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2.2rem' }}>📍</div>
          <h3 style={{ margin: '0.4rem 0' }}>Where is your farm?</h3>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
            Pick a state and district above to see the weather — or save your <Link to="/farmer/profile">home location in your profile</Link> so it loads automatically.
          </p>
        </div>
      )}

      {data && (
        <div style={{ opacity: loading ? 0.55 : 1, transition: 'opacity .2s' }} aria-busy={loading}>
          {/* Current */}
          <div style={{ ...card, marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '3.4rem', lineHeight: 1 }} aria-hidden="true">{data.current.condition.icon}</div>
                <div>
                  <div style={{ fontSize: '2.6rem', fontWeight: 900, lineHeight: 1 }} data-testid="current-temp">{dash(data.current.temperature, '°C')}</div>
                  <div style={{ fontWeight: 700 }}>{data.current.condition.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Feels like {dash(data.current.feelsLike, '°C')}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Updated {new Date(data.fetchedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                <div><button className="btn btn-secondary btn-sm" style={{ marginTop: 6 }} onClick={() => load(lastRequest)} disabled={loading}>🔄 Refresh</button></div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.7rem', marginTop: '1.1rem' }}>
              <Metric icon="💧" label="Humidity" value={dash(data.current.humidity, '%')} />
              <Metric icon="🌧️" label="Rainfall now" value={dash(data.current.precipitation, ' mm')} sub={`Today: ${dash(data.forecast[0]?.rainfall, ' mm')} (${dash(data.forecast[0]?.rainChance, '%')} chance)`} />
              <Metric icon="💨" label="Wind" value={dash(data.current.windSpeed, ' km/h')} sub={`${data.current.windDirectionLabel ? `from ${data.current.windDirectionLabel}` : ''}${data.current.windGusts != null ? ` · gusts ${data.current.windGusts}` : ''}`} />
              <Metric icon="🌡️" label="Today" value={`${dash(data.forecast[0]?.tempMax, '°')} / ${dash(data.forecast[0]?.tempMin, '°')}`} sub="High / Low" />
            </div>
          </div>

          {/* Farm advice */}
          {data.farmAdvice && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.9rem', marginBottom: '1.25rem' }}>
              {[['🚜', 'Spraying', data.farmAdvice.spraying], ['💧', 'Irrigation', data.farmAdvice.irrigation], ['🌾', 'Field work', data.farmAdvice.fieldWork]].map(([icon, title, a]) => (
                <div key={title} style={card} data-testid={`advice-${title.toLowerCase().replace(' ', '-')}`}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{icon} {title} today</div>
                  <div style={{ fontWeight: 800, color: ADVICE_COLOR[a.status], margin: '0.25rem 0' }}>{a.label}</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>{a.text}</div>
                </div>
              ))}
            </div>
          )}

          {/* Alerts */}
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.7rem' }}>🔔 Farming alerts</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1.5rem' }}>
            {data.alerts.length === 0
              ? <div className="alert alert-success">No weather alerts for the next 5 days — conditions look normal.</div>
              : data.alerts.map((a) => <AlertItem key={a.id} alert={a} />)}
          </div>

          {/* 5-day forecast */}
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.7rem' }}>📅 5-day forecast</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.8rem', marginBottom: '1.5rem' }}>
            {data.forecast.map((d, i) => (
              <div key={d.date} style={{ ...card, padding: '1rem', textAlign: 'center' }} data-testid="forecast-day">
                <div style={{ fontWeight: 800 }}>{dayName(d.date, i)}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{shortDate(d.date)}</div>
                <div style={{ fontSize: '2.2rem', margin: '0.3rem 0' }} aria-hidden="true">{d.condition.icon}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, minHeight: '2.2em' }}>{d.condition.label}</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0.3rem 0' }}>{dash(d.tempMax, '°')} <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>/ {dash(d.tempMin, '°')}</span></div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  🌧️ {dash(d.rainfall, ' mm')} · {dash(d.rainChance, '%')}<br />
                  💧 {dash(d.humidity, '%')} humidity<br />
                  💨 {dash(d.windSpeed, ' km/h')}
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Weather data by <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo.com</a>. Alerts are advisory guidance based on forecast values;
            for official warnings see the <a href="https://mausam.imd.gov.in/" target="_blank" rel="noopener noreferrer">India Meteorological Department</a>.
          </p>
        </div>
      )}
    </div>
  );
};

export default WeatherAdvisory;