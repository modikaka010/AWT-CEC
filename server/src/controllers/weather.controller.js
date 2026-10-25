const User = require('../models/User');
const Farm = require('../models/Farm');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { STATES, findState } = require('../data/indiaStates');
const { WeatherError, getWeatherReport, suggestPlaces } = require('../services/weather.service');

// Letters (any script), digits, spaces and . , ' ( ) -   — keeps junk out of upstream queries
const PLACE_RE = /^[\p{L}\p{M}\p{N}\s.,'()-]{2,100}$/u;
// Rough bounding box of India; rejects coordinates that obviously aren't
const IN_INDIA = (lat, lon) => lat >= 6 && lat <= 38 && lon >= 68 && lon <= 98;

const fail = (res, err, fallback) => {
  if (err instanceof WeatherError) {
    return res.status(err.status).json({ success: false, code: err.code, message: err.message });
  }
  console.error(fallback, err);
  return sendError(res, 500, fallback);
};

/** The farmer's default place: profile location first, then their first farm. */
const getDefaultLocation = async (farmerId) => {
  const user = await User.findById(farmerId).select('location').lean();
  const pState = findState(user?.location?.state);
  if (pState && user?.location?.district) {
    return { state: pState.name, district: user.location.district, source: 'profile' };
  }
  const farms = await Farm.find({ farmer: farmerId }).sort({ createdAt: 1 });
  for (const f of farms) {
    const fState = findState(f.location?.state);
    if (fState && f.location?.district) {
      return { state: fState.name, district: f.location.district, source: 'farm', farmName: f.name };
    }
  }
  return null;
};

// GET /api/farmer/weather/states
const getStates = (req, res) => sendSuccess(res, 200, 'States fetched.', { states: STATES.map((s) => s.name) });

// GET /api/farmer/weather/places?q=lud&state=Punjab
const searchPlaces = async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (q.length < 2 || q.length > 60 || !PLACE_RE.test(q)) return sendError(res, 400, 'Type at least 2 letters of a place name.');
    const state = typeof req.query.state === 'string' && req.query.state ? req.query.state : undefined;
    const places = await suggestPlaces(q, state);
    return sendSuccess(res, 200, 'Places fetched.', { places });
  } catch (err) {
    return fail(res, err, 'Failed to search places.');
  }
};

// GET /api/farmer/weather            → default location (profile → first farm)
// GET /api/farmer/weather?state=&district=[&lat=&lon=]  → any place in India
const getWeather = async (req, res) => {
  try {
    const { state, district, lat, lon } = req.query;
    const defaultLocation = await getDefaultLocation(req.user.id);
    const asked = state !== undefined || district !== undefined || lat !== undefined || lon !== undefined;

    let place, source;
    if (asked) {
      if (typeof state !== 'string' || !findState(state)) return sendError(res, 400, 'Please choose a valid Indian state or union territory.');
      if (typeof district !== 'string' || !PLACE_RE.test(district.trim())) return sendError(res, 400, 'Please enter a valid district or place name.');
      place = { state, district: district.trim() };
      source = 'search';

      if (lat !== undefined || lon !== undefined) {
        const la = Number(lat), lo = Number(lon);
        if (lat === '' || lon === '' || !Number.isFinite(la) || !Number.isFinite(lo)) return sendError(res, 400, 'Latitude and longitude must both be numbers.');
        if (!IN_INDIA(la, lo)) return sendError(res, 400, 'Coordinates must be within India.');
        place.latitude = la;
        place.longitude = lo;
      }
    } else if (defaultLocation) {
      place = defaultLocation;
      source = defaultLocation.source;
    } else {
      // Nothing saved yet — the page asks the farmer to pick a place / set their profile
      return sendSuccess(res, 200, 'No default location.', { needsLocation: true, defaultLocation: null });
    }

    const report = await getWeatherReport(place);
    report.location.source = source;
    return sendSuccess(res, 200, 'Weather fetched.', { ...report, defaultLocation, needsLocation: false });
  } catch (err) {
    return fail(res, err, 'Failed to fetch weather.');
  }
};

module.exports = { getStates, searchPlaces, getWeather, getDefaultLocation };