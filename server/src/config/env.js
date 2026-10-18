// Centralised environment variable access with defaults and validation

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  emailHost: process.env.EMAIL_HOST,
  emailPort: parseInt(process.env.EMAIL_PORT, 10) || 587,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  otpExpiresMinutes: parseInt(process.env.OTP_EXPIRES_MINUTES, 10) || 5,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // Weather (Open-Meteo — free for non-commercial use, no API key needed).
  // Every value is optional; the defaults below work out of the box.
  weather: {
    forecastUrl: process.env.WEATHER_API_URL || 'https://api.open-meteo.com/v1/forecast',
    geocodingUrl: process.env.WEATHER_GEOCODING_URL || 'https://geocoding-api.open-meteo.com/v1/search',
    apiKey: process.env.WEATHER_API_KEY || '', // only for a paid/commercial Open-Meteo plan
    timeoutMs: parseInt(process.env.WEATHER_TIMEOUT_MS, 10) || 8000,
    retryDelayMs: 300,
    cacheTtlMs: (parseInt(process.env.WEATHER_CACHE_MINUTES, 10) || 15) * 60 * 1000,
    geoCacheTtlMs: 24 * 60 * 60 * 1000,
    rateLimitPerMinute: parseInt(process.env.WEATHER_RATE_LIMIT_PER_MIN, 10) || 30,
  },
};

const required = ['MONGO_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];

required.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Warning: Environment variable ${key} is not set`);
  }
});

module.exports = env;
