// Pure functions (no I/O): weather-code labels, compass, and farming alert rules.
// Thresholds follow IMD (India Meteorological Department) classes where one exists.

const CODES = {
  0: ['Clear sky', '☀️'], 1: ['Mainly clear', '🌤️'], 2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁️'],
  45: ['Fog', '🌫️'], 48: ['Freezing fog', '🌫️'],
  51: ['Light drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Dense drizzle', '🌦️'],
  56: ['Freezing drizzle', '🌧️'], 57: ['Freezing drizzle', '🌧️'],
  61: ['Light rain', '🌧️'], 63: ['Moderate rain', '🌧️'], 65: ['Heavy rain', '🌧️'],
  66: ['Freezing rain', '🌧️'], 67: ['Freezing rain', '🌧️'],
  71: ['Light snow', '🌨️'], 73: ['Snow', '🌨️'], 75: ['Heavy snow', '❄️'], 77: ['Snow grains', '🌨️'],
  80: ['Light showers', '🌦️'], 81: ['Rain showers', '🌧️'], 82: ['Violent showers', '⛈️'],
  85: ['Snow showers', '🌨️'], 86: ['Heavy snow showers', '❄️'],
  95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm with hail', '⛈️'], 99: ['Thunderstorm with heavy hail', '⛈️'],
};

const describeCode = (code) => {
  const [label, icon] = CODES[code] || ['Unknown', '🌡️'];
  return { code, label, icon };
};

const POINTS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
const compass = (deg) => (Number.isFinite(deg) ? POINTS[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16] : null);

const RANK = { severe: 3, warning: 2, advisory: 1, info: 0 };
const num = (v, fallback = 0) => (Number.isFinite(v) ? v : fallback);

/**
 * days: [{ date, tempMax, tempMin, rainfall, rainChance, humidity, windSpeed, windGusts, condition:{code} }]
 * Returns alerts aggregated by type (worst severity wins), each listing the affected dates.
 */
const buildAlerts = (days) => {
  const byType = new Map();
  const add = (type, severity, title, message, advice, date) => {
    const cur = byType.get(type);
    if (!cur) {
      byType.set(type, { id: type, type, severity, title, message, advice, dates: [date] });
    } else {
      if (!cur.dates.includes(date)) cur.dates.push(date);
      if (RANK[severity] > RANK[cur.severity]) Object.assign(cur, { severity, title, message, advice });
    }
  };

  for (const d of days) {
    const rain = num(d.rainfall), tmax = num(d.tempMax), tmin = num(d.tempMin, tmax);
    const wind = num(d.windSpeed), gust = num(d.windGusts), hum = num(d.humidity), code = d.condition?.code;
    const tmean = (tmax + tmin) / 2;

    // Rain (IMD: moderate 15.6–64.4, heavy 64.5–115.5, very heavy ≥115.6 mm/day)
    if (rain >= 115.6) add('rain', 'severe', 'Very heavy rainfall expected', `About ${Math.round(rain)} mm of rain is forecast in a day — flooding and waterlogging are likely.`, 'Open drainage channels, move harvested produce and inputs to high ground, and avoid field work and spraying.', d.date);
    else if (rain >= 64.5) add('rain', 'warning', 'Heavy rainfall expected', `About ${Math.round(rain)} mm of rain is forecast in a day.`, 'Drain excess water from fields, harvest ripe crops early if possible, and postpone fertiliser and pesticide application.', d.date);
    else if (rain >= 15.6) add('rain', 'advisory', 'Moderate rain expected', `Around ${Math.round(rain)} mm of rain is forecast.`, 'Delay spraying and irrigation; cover stored grain and harvested produce.', d.date);

    // Thunderstorm / hail
    if (code === 96 || code === 99) add('storm', 'severe', 'Thunderstorm with hail', 'Hailstorms can badly damage standing crops, fruit and polyhouses.', 'Secure polyhouse/shade nets, keep livestock indoors and stay away from open fields during the storm.', d.date);
    else if (code === 95) add('storm', 'warning', 'Thunderstorm and lightning', 'Thunderstorms are likely.', 'Avoid working in open fields or under trees during lightning; keep livestock sheltered.', d.date);

    // Heat
    if (tmax >= 45) add('heat', 'severe', 'Severe heat wave', `Maximum temperature may reach ${Math.round(tmax)}°C.`, 'Irrigate in the evening, mulch the soil, shade nurseries and livestock, and avoid midday field work.', d.date);
    else if (tmax >= 40) add('heat', 'warning', 'Heat wave conditions', `Maximum temperature may reach ${Math.round(tmax)}°C.`, 'Irrigate in the evening or at night, mulch to hold moisture, and give livestock shade and water.', d.date);
    else if (tmax >= 38) add('heat', 'advisory', 'Hot weather — heat stress risk', `Maximum temperature around ${Math.round(tmax)}°C.`, 'Watch for wilting; irrigate in the cooler hours.', d.date);

    // Cold / frost
    if (tmin <= 2) add('cold', 'severe', 'Frost risk', `Night temperature may drop to ${Math.round(tmin)}°C.`, 'Light irrigation in the evening, cover nurseries and sensitive crops (potato, vegetables), and smoke or mulch to protect them.', d.date);
    else if (tmin <= 4) add('cold', 'warning', 'Cold wave conditions', `Night temperature may drop to ${Math.round(tmin)}°C.`, 'Protect nurseries and young plants; irrigate lightly in the evening.', d.date);

    // Wind
    if (wind >= 62 || gust >= 90) add('wind', 'severe', 'Very strong winds', `Winds up to ${Math.round(Math.max(wind, gust))} km/h are possible.`, 'Support tall crops and orchard trees, secure polyhouses and sheds, and do not spray.', d.date);
    else if (wind >= 40 || gust >= 60) add('wind', 'warning', 'Strong winds', `Winds up to ${Math.round(Math.max(wind, gust))} km/h are possible.`, 'Stake tall crops (banana, maize, sugarcane); avoid spraying.', d.date);

    // Disease pressure
    if (hum >= 85 && tmean >= 18 && tmean <= 32) add('disease', 'advisory', 'High fungal disease risk', `Humidity averages ${Math.round(hum)}% with mild temperatures.`, 'Scout fields for blight, rust, mildew and blast; keep protective fungicide ready and avoid overhead irrigation.', d.date);
  }

  // Dry spell across the whole window
  const totalRain = days.reduce((s, d) => s + num(d.rainfall), 0);
  const peak = Math.max(...days.map((d) => num(d.tempMax)));
  if (days.length >= 4 && totalRain < 2 && peak >= 35) {
    byType.set('dry', { id: 'dry', type: 'dry', severity: 'advisory', title: 'Dry, hot spell — plan irrigation', message: `Almost no rain is expected in the next ${days.length} days (${totalRain.toFixed(1)} mm) and temperatures reach ${Math.round(peak)}°C.`, advice: 'Schedule irrigation, mulch to reduce evaporation, and prioritise water for crops at flowering or grain filling.', dates: days.map((d) => d.date) });
  }

  // Good spraying days (positive info)
  const sprayDays = days.filter((d) => num(d.windSpeed) <= 12 && num(d.rainfall) < 1 && num(d.rainChance) <= 20 && ![95, 96, 99].includes(d.condition?.code)).map((d) => d.date);
  if (sprayDays.length) {
    byType.set('spray_window', { id: 'spray_window', type: 'spray_window', severity: 'info', title: 'Good spraying conditions', message: 'Calm wind and dry weather are forecast on these days.', advice: 'Spray pesticides or foliar nutrients early in the morning or late in the evening.', dates: sprayDays });
  }

  return [...byType.values()].sort((a, b) => RANK[b.severity] - RANK[a.severity] || a.dates[0].localeCompare(b.dates[0]));
};

/** Quick "what should I do today" guidance from the first days of the forecast. */
const buildFarmAdvice = (days) => {
  const today = days[0];
  if (!today) return null;
  const rain = num(today.rainfall), chance = num(today.rainChance), wind = num(today.windSpeed), tmax = num(today.tempMax);
  const storm = [95, 96, 99].includes(today.condition?.code);
  const rain3 = days.slice(0, 3).reduce((s, d) => s + num(d.rainfall), 0);

  let spraying;
  if (storm || rain >= 1 || chance >= 50 || wind >= 20) spraying = { status: 'avoid', label: 'Avoid spraying', text: 'Rain or strong wind would wash off or drift the spray.' };
  else if (wind >= 12 || chance >= 30) spraying = { status: 'caution', label: 'Spray with care', text: 'Spray only in calm hours (early morning) and watch the sky.' };
  else spraying = { status: 'good', label: 'Good for spraying', text: 'Calm and dry — spray early morning or late evening.' };

  let irrigation;
  if (rain3 >= 10) irrigation = { status: 'skip', label: 'Hold irrigation', text: `About ${Math.round(rain3)} mm of rain is expected in the next 3 days.` };
  else if (tmax >= 35 && rain3 < 2) irrigation = { status: 'needed', label: 'Irrigation advised', text: 'Hot and dry — irrigate in the evening or early morning.' };
  else irrigation = { status: 'normal', label: 'Irrigate as needed', text: 'No significant rain expected — follow your usual crop schedule.' };

  let fieldWork;
  if (rain >= 10 || chance >= 60 || storm) fieldWork = { status: 'avoid', label: 'Postpone field work', text: 'Wet conditions — delay harvesting, threshing and sowing if you can.' };
  else fieldWork = { status: 'good', label: 'Suitable for field work', text: 'Weather is fine for harvesting, sowing and other field operations.' };

  return { spraying, irrigation, fieldWork };
};

module.exports = { describeCode, compass, buildAlerts, buildFarmAdvice };