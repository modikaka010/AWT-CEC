const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/**
 * Protects the free upstream weather API (and our quota) from abuse:
 * N requests per minute per logged-in farmer. Mount AFTER protect() so req.user is set.
 */
const weatherLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: env.weather.rateLimitPerMinute,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `weather:${req.user?.id || req.ip}`,
  handler: (req, res) =>
    res.status(429).json({ success: false, code: 'RATE_LIMITED', message: 'Too many weather requests. Please wait a minute and try again.' }),
});

module.exports = { weatherLimiter };