import api from './api';

/**
 * Send OTP to the given email during registration.
 * @param {{ name, email, mobile, role }} data
 */
export const sendOtp = async (data) => {
  const res = await api.post('/auth/send-otp', data);
  return res.data;
};

/**
 * Resend OTP to email.
 * @param {string} email
 */
export const resendOtp = async (email) => {
  const res = await api.post('/auth/resend-otp', { email });
  return res.data;
};

/**
 * Verify the 6-digit OTP.
 * @param {{ email, otp }} data
 */
export const verifyOtp = async (data) => {
  const res = await api.post('/auth/verify-otp', data);
  return res.data;
};

/**
 * Complete Farmer / Buyer registration after OTP verification.
 * @param {{ name, email, mobile, role, password }} data
 */
export const register = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

/**
 * Complete Expert registration — multipart/form-data.
 * @param {FormData} formData
 */
export const registerExpert = async (formData) => {
  const res = await api.post('/auth/register-expert', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

/**
 * Login with email/loginId + password.
 * @param {{ identifier, password }} data
 */
export const login = async (data) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

/**
 * Admin-specific login.
 * @param {{ identifier, password }} data
 */
export const adminLogin = async (data) => {
  const res = await api.post('/auth/admin-login', data);
  return res.data;
};

/**
 * Fetch the currently authenticated user from the backend.
 */
export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
};

export const resetPassword = async (data) => {
  const res = await api.post('/auth/reset-password', data); // { email, otp, newPassword }
  return res.data;
};