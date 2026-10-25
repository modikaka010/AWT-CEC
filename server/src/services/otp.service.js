const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Otp = require('../models/Otp');

const OTP_EXPIRES_MINUTES = parseInt(process.env.OTP_EXPIRES_MINUTES, 10) || 5;
const MAX_RESEND_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 5;

/**
 * Generate a cryptographically random 6-digit OTP string.
 */
const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

/**
 * Create and save a new OTP record for the given email.
 * Invalidates any previous unverified OTP for the same email + purpose.
 *
 * @param {string} email
 * @param {string} purpose - 'registration' | 'login' | 'password-reset'
 * @returns {{ otp: string, expiresAt: Date }} plain OTP (to send in email) + expiry
 */
const createOtp = async (email, purpose = 'registration') => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check resend rate limit within the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await Otp.countDocuments({
    email: normalizedEmail,
    purpose,
    createdAt: { $gte: oneHourAgo },
  });

  if (recentCount >= MAX_RESEND_PER_HOUR) {
    const err = new Error('Too many OTP requests. Please try again in an hour.');
    err.statusCode = 429;
    throw err;
  }

  // Delete previous OTPs for this email + purpose
  await Otp.deleteMany({ email: normalizedEmail, purpose });

  const plainOtp = generateOtp();
  const hashedOtp = await bcrypt.hash(plainOtp, 10);

  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

  await Otp.create({
    email: normalizedEmail,
    otp: hashedOtp,
    purpose,
    expiresAt,
  });

  return { otp: plainOtp, expiresAt };
};

/**
 * Verify an OTP submitted by the user.
 *
 * @param {string} email
 * @param {string} plainOtp - the 6-digit code from the user
 * @param {string} purpose
 * @returns {boolean} true if valid
 * @throws error with statusCode if invalid, expired, or too many attempts
 */
const verifyOtp = async (email, plainOtp, purpose = 'registration') => {
  const normalizedEmail = email.toLowerCase().trim();

  const record = await Otp.findOne({
    email: normalizedEmail,
    purpose,
    verified: false,
  }).sort({ createdAt: -1 });

  if (!record) {
    const err = new Error('No active OTP found. Please request a new OTP.');
    err.statusCode = 400;
    throw err;
  }

  // Check expiry
  if (record.expiresAt < new Date()) {
    await Otp.deleteOne({ _id: record._id });
    const err = new Error('OTP has expired. Please request a new one.');
    err.statusCode = 400;
    throw err;
  }

  // Check attempt limit
  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    await Otp.deleteOne({ _id: record._id });
    const err = new Error('Too many incorrect attempts. Please request a new OTP.');
    err.statusCode = 429;
    throw err;
  }

  const isMatch = await bcrypt.compare(plainOtp, record.otp);

  if (!isMatch) {
    record.attempts += 1;
    await record.save();
    const remaining = MAX_VERIFY_ATTEMPTS - record.attempts;
    const err = new Error(
      `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
    );
    err.statusCode = 400;
    throw err;
  }

  // Mark as verified and delete (consumed)
  await Otp.deleteOne({ _id: record._id });

  return true;
};

module.exports = { createOtp, verifyOtp };
