const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true, // stored as bcrypt hash
    },
    purpose: {
      type: String,
      enum: ['registration', 'login', 'password-reset'],
      default: 'registration',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    // Track number of OTPs sent within a window to prevent abuse
    resendCount: {
      type: Number,
      default: 0,
    },
    lastResendAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index — MongoDB will auto-delete expired OTP documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ email: 1, purpose: 1 });

module.exports = mongoose.model('Otp', otpSchema);
