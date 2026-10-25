const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const {
  sendOtp,
  verifyOtpHandler,
  register,
  registerExpert,
  resendOtp,
  login,
  adminLogin,
  forgotPassword,   
  resetPassword,
  getMe,
} = require('../controllers/auth.controller');

const { protect } = require('../middleware/auth.middleware');
const { uploadExpertDocs } = require('../middleware/upload.middleware');

// ── Rate Limiters ─────────────────────────────────────────────────────────────

// Limit OTP sends: 10 requests per 15 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many OTP requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit login attempts: 20 per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many reset requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Auth Routes ───────────────────────────────────────────────────────────────

// OTP flow
router.post('/send-otp', otpLimiter, sendOtp);
router.post('/resend-otp', otpLimiter, resendOtp);
router.post('/verify-otp', verifyOtpHandler);

// Registration
router.post('/register', register);
router.post(
  '/register-expert',
  uploadExpertDocs.array('documents', 5),
  registerExpert
);

// Login
router.post('/login', loginLimiter, login);
router.post('/admin-login', loginLimiter, adminLogin);
// Forgot password (email OTP)
router.post('/forgot-password', forgotLimiter, forgotPassword);
router.post('/reset-password', resetLimiter, resetPassword);

// Protected — get current user
router.get('/me', protect, getMe);

module.exports = router;
