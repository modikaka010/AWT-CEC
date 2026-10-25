const path = require('path');
const User = require('../models/User');
const ExpertRequest = require('../models/ExpertRequest');
const { createOtp, verifyOtp } = require('../services/otp.service');
const { sendOtpEmail, sendWelcomeEmail, sendExpertPendingEmail, sendPasswordResetEmail} = require('../services/email.service');
const { generateLoginId } = require('../services/loginId.service');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { generateToken } = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { notifyAdmins } = require('../services/notification.service');

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Send OTP
// POST /api/auth/send-otp
// Body: { name, email, mobile, role }
// For experts also: { specialization, qualifications, experience, organization }
// ─────────────────────────────────────────────────────────────────────────────
const sendOtp = async (req, res) => {
  try {
    const { name, email, mobile, role } = req.body;

    // Basic field validation
    if (!name || !email || !mobile || !role) {
      return sendError(res, 400, 'Name, email, mobile and role are required.');
    }

    const allowedRoles = ['farmer', 'buyer', 'expert'];
    if (!allowedRoles.includes(role)) {
      return sendError(res, 400, 'Invalid role selected.');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already registered and verified
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing && existing.emailVerified) {
      return sendError(res, 409, 'An account with this email already exists. Please login.');
    }

    // Remove any incomplete (unverified) registration for same email
    if (existing && !existing.emailVerified) {
      await User.deleteOne({ _id: existing._id });
    }

    // Generate and send OTP
    const { otp, expiresAt } = await createOtp(normalizedEmail, 'registration');
    await sendOtpEmail(normalizedEmail, otp, parseInt(process.env.OTP_EXPIRES_MINUTES, 10) || 5);

    return sendSuccess(res, 200, 'OTP sent to your email address.', {
      email: normalizedEmail,
      expiresAt,
    });
  } catch (err) {
    if (err.statusCode) return sendError(res, err.statusCode, err.message);
    console.error('sendOtp error:', err);
    return sendError(res, 500, 'Failed to send OTP. Please try again.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Verify OTP
// POST /api/auth/verify-otp
// Body: { email, otp }
// ─────────────────────────────────────────────────────────────────────────────
const verifyOtpHandler = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendError(res, 400, 'Email and OTP are required.');
    }

    await verifyOtp(email.toLowerCase().trim(), otp.toString().trim(), 'registration');

    return sendSuccess(res, 200, 'OTP verified successfully.');
  } catch (err) {
    if (err.statusCode) return sendError(res, err.statusCode, err.message);
    console.error('verifyOtp error:', err);
    return sendError(res, 500, 'OTP verification failed. Please try again.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Complete Registration (Farmer / Buyer)
// POST /api/auth/register
// Body: { name, email, mobile, role, password }
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, mobile, role, password } = req.body;

    if (!name || !email || !mobile || !role || !password) {
      return sendError(res, 400, 'All fields are required.');
    }

    const allowedRoles = ['farmer', 'buyer'];
    if (!allowedRoles.includes(role)) {
      return sendError(
        res,
        400,
        'Use the expert registration endpoint for expert accounts.'
      );
    }

    if (password.length < 8) {
      return sendError(res, 400, 'Password must be at least 8 characters.');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Ensure email is not already registered
    const existing = await User.findOne({ email: normalizedEmail, emailVerified: true });
    if (existing) {
      return sendError(res, 409, 'An account with this email already exists.');
    }

    const hashed = await hashPassword(password);
    const loginId = await generateLoginId(role);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      mobile: mobile.trim(),
      role,
      password: hashed,
      emailVerified: true,
      status: 'active',
      loginId,
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(normalizedEmail, name.trim(), loginId).catch((e) =>
      console.error('Welcome email error:', e.message)
    );

    const token = generateToken({ id: user._id, role: user.role, status: user.status });

    return sendSuccess(res, 201, 'Account created successfully.', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        loginId: user.loginId,
      },
    });
  } catch (err) {
    console.error('register error:', err);
    return sendError(res, 500, 'Registration failed. Please try again.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 (Expert) — Complete Expert Registration
// POST /api/auth/register-expert
// Multipart form-data: { name, email, mobile, specialization, qualifications,
//                        experience, organization } + files
// ─────────────────────────────────────────────────────────────────────────────
const registerExpert = async (req, res) => {
  try {
    const { name, email, mobile, specialization, qualifications, experience, organization, password } =
      req.body;

    if (!name || !email || !mobile || !password) {
      return sendError(res, 400, 'Name, email, mobile and password are required.');
    }

    if (password.length < 8) {
      return sendError(res, 400, 'Password must be at least 8 characters.');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Ensure email is not already taken
    const existing = await User.findOne({ email: normalizedEmail, emailVerified: true });
    if (existing) {
      return sendError(res, 409, 'An account with this email already exists.');
    }

    // Collect uploaded document URLs
    const documentUrls = req.files
      ? req.files.map((f) => `/uploads/expert-docs/${f.filename}`)
      : [];

    const hashed = await hashPassword(password);
    const loginId = await generateLoginId('expert');

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      mobile: mobile.trim(),
      role: 'expert',
      password: hashed,
      emailVerified: true,
      status: 'pending',
      loginId,
      expertInfo: {
        specialization: specialization || null,
        qualifications: qualifications || null,
        experience: experience || null,
        organization: organization || null,
        documentUrls,
      },
    });

    // Create expert review record
    await ExpertRequest.create({
      user: user._id,
      name: user.name,
      email: user.email,
      specialization: specialization || null,
      qualifications: qualifications || null,
      experience: experience || null,
      organization: organization || null,
      documentUrls,
    });

    await notifyAdmins({
      type: 'expert_registration',
      title: 'New Expert Application',
      message: `${user.name} submitted an expert application for review.`,
      link: '/admin/verification/requests',
    });

    // Notify expert by email (non-blocking)
    sendExpertPendingEmail(normalizedEmail, name.trim()).catch((e) =>
      console.error('Expert pending email error:', e.message)
    );

    return sendSuccess(res, 201, 'Expert application submitted. Awaiting admin approval.', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        loginId: user.loginId,
      },
    });
  } catch (err) {
    console.error('registerExpert error:', err);
    return sendError(res, 500, 'Expert registration failed. Please try again.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// RESEND OTP
// POST /api/auth/resend-otp
// Body: { email }
// ─────────────────────────────────────────────────────────────────────────────
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 400, 'Email is required.');

    const normalizedEmail = email.toLowerCase().trim();

    const { otp, expiresAt } = await createOtp(normalizedEmail, 'registration');
    await sendOtpEmail(normalizedEmail, otp, parseInt(process.env.OTP_EXPIRES_MINUTES, 10) || 5);

    return sendSuccess(res, 200, 'A new OTP has been sent to your email.', { expiresAt });
  } catch (err) {
    if (err.statusCode) return sendError(res, err.statusCode, err.message);
    console.error('resendOtp error:', err);
    return sendError(res, 500, 'Failed to resend OTP. Please try again.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// POST /api/auth/login
// Body: { identifier (email or loginId), password }
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return sendError(res, 400, 'Email/Login ID and password are required.');
    }

    const trimmed = identifier.toLowerCase().trim();

    // Find by email or loginId — explicitly select password back in
    const user = await User.findOne({
      $or: [{ email: trimmed }, { loginId: identifier.trim().toUpperCase() }],
    }).select('+password');

    if (!user) {
      return sendError(res, 401, 'Invalid credentials.');
    }

    // Check password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid credentials.');
    }

    // Account status checks
    if (user.status === 'suspended') {
      return sendError(res, 403, 'Your account has been suspended. Please contact support.');
    }

    if (user.role === 'expert' && user.status === 'rejected') {
      return sendError(res, 403, 'Your expert application was rejected.', {
        status: 'rejected',
        reason: user.rejectionReason || 'No reason provided.',
      });
    }

    const token = generateToken({ id: user._id, role: user.role, status: user.status });

    return sendSuccess(res, 200, 'Login successful.', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        loginId: user.loginId,
      },
    });
  } catch (err) {
    console.error('login error:', err);
    return sendError(res, 500, 'Login failed. Please try again.');
  }
};

// FORGOT PASSWORD — Step 1: email a reset code
// POST /api/auth/forgot-password   Body: { email }
// Always gives the same reply, whether or not the email is registered.
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return sendError(res, 400, 'Email is required.');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const genericMessage =
      'If an account exists for this email, a password reset code has been sent.';

    const user = await User.findOne({ email: normalizedEmail, emailVerified: true });

    // Unknown email, or an admin account (admins are not reset through the public flow)
    if (!user || user.role === 'admin') {
      return sendSuccess(res, 200, genericMessage, { email: normalizedEmail });
    }

    const expiresMinutes = parseInt(process.env.OTP_EXPIRES_MINUTES, 10) || 5;
    const { otp } = await createOtp(normalizedEmail, 'password-reset');
    await sendPasswordResetEmail(normalizedEmail, user.name, otp, expiresMinutes);

    return sendSuccess(res, 200, genericMessage, { email: normalizedEmail });
  } catch (err) {
    if (err.statusCode) return sendError(res, err.statusCode, err.message);
    console.error('forgotPassword error:', err);
    return sendError(res, 500, 'Failed to send reset code. Please try again.');
  }
};

// FORGOT PASSWORD — Step 2: verify the code AND set the new password
// POST /api/auth/reset-password   Body: { email, otp, newPassword }
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return sendError(res, 400, 'Email, code and new password are required.');
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return sendError(res, 400, 'Password must be at least 8 characters.');
    }

    const normalizedEmail = email.toString().toLowerCase().trim();

    // Throws (400 / 429) if the code is wrong, expired, or attempts are used up.
    await verifyOtp(normalizedEmail, otp.toString().trim(), 'password-reset');

    const user = await User.findOne({ email: normalizedEmail, emailVerified: true });
    if (!user || user.role === 'admin') {
      return sendError(res, 400, 'Unable to reset password for this account.');
    }

    // Update ONLY the password field (user.save() would validate the whole record and
    // can fail on unrelated fields, leaving the old password in place).
    const hashed = await hashPassword(newPassword);
    const result = await User.updateOne({ _id: user._id }, { $set: { password: hashed } });
    if (!result.matchedCount) {
      return sendError(res, 400, 'Unable to reset password for this account.');
    }

    // Read it back and confirm the NEW password is what is now stored.
    const saved = await User.findById(user._id).select('+password');
    if (!saved || !saved.password || !(await comparePassword(newPassword, saved.password))) {
      console.error('resetPassword: new password was not stored for user', String(user._id));
      return sendError(res, 500, 'Password could not be updated. Please try again.');
    }
    return sendSuccess(
      res,
      200,
      'Password reset successfully. You can now sign in with your new password.'
    );
  } catch (err) {
    if (err.statusCode) return sendError(res, err.statusCode, err.message);
    console.error('resetPassword error:', err);
    return sendError(res, 500, 'Password reset failed. Please try again.');
  }
};
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN LOGIN
// POST /api/auth/admin-login
// Body: { identifier, password }
// ─────────────────────────────────────────────────────────────────────────────
const adminLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return sendError(res, 400, 'Credentials are required.');
    }

    const trimmed = identifier.toLowerCase().trim();

    const user = await User.findOne({
      $or: [{ email: trimmed }, { loginId: identifier.trim().toUpperCase() }],
      role: 'admin',
    }).select('+password');

    if (!user) {
      return sendError(res, 401, 'Invalid admin credentials.');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid admin credentials.');
    }

    if (user.status !== 'active') {
      return sendError(res, 403, 'Admin account is not active.');
    }

    const token = generateToken({ id: user._id, role: user.role, status: user.status });

    return sendSuccess(res, 200, 'Admin login successful.', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        loginId: user.loginId,
      },
    });
  } catch (err) {
    console.error('adminLogin error:', err);
    return sendError(res, 500, 'Admin login failed. Please try again.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ME — return current user from JWT
// GET /api/auth/me
// Requires: Authorization: Bearer <token>
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, 404, 'User not found.');

    return sendSuccess(res, 200, 'User fetched.', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        loginId: user.loginId,
        emailVerified: user.emailVerified,
        expertInfo: user.role === 'expert' ? user.expertInfo : undefined,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('getMe error:', err);
    return sendError(res, 500, 'Failed to fetch user.');
  }
};

module.exports = {
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
};
