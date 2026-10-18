import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OtpInput from '../../components/common/OtpInput';
import PasswordInput from '../../components/common/PasswordInput';
import Loader from '../../components/common/Loader';
import Logo from '../../components/common/Logo';
import { forgotPassword, resetPassword } from '../../services/authService';

const RESEND_COOLDOWN = 30; // seconds
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const passwordStrength = (pw) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0–4
};

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#D93829', '#D97706', '#1D64B4', '#1F7A4D'];

const IconBubble = ({ children }) => (
  <div
    style={{
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: 'var(--color-primary-muted)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.75rem',
      margin: '0 auto 0.75rem',
    }}
  >
    {children}
  </div>
);

const ForgotPassword = () => {
  const navigate = useNavigate();

  // 'email' → 'reset' → 'done'
  const [step, setStep] = useState('email');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [countdown, setCountdown] = useState(0);

  const strength = passwordStrength(password);

  // Resend countdown
  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // After success, go to the login page automatically
  useEffect(() => {
    if (step !== 'done') return undefined;
    const timer = setTimeout(() => navigate('/login', { replace: true }), 3500);
    return () => clearTimeout(timer);
  }, [step, navigate]);

  // Step 1: request the code
  const handleSendCode = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      setFieldErrors({ email: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    setError('');
    try {
      await forgotPassword(trimmed);
      setEmail(trimmed);
      setStep('reset');
      setCountdown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send the reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    setError('');
    setSuccess('');
    try {
      await forgotPassword(email);
      setSuccess('A new code has been sent if this email is registered.');
      setCountdown(RESEND_COOLDOWN);
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend the code.');
    } finally {
      setResending(false);
    }
  };

  // Step 2: code + new password
  const handleReset = async (e) => {
    e.preventDefault();
    const errors = {};
    if (otp.length < 6) errors.otp = 'Please enter the complete 6-digit code.';
    if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
    if (password !== confirm) errors.confirm = 'Passwords do not match.';
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      if (errors.otp) setError(errors.otp);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await resetPassword({ email, otp, newPassword: password });
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Please try again.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const backToEmail = () => {
    setStep('email');
    setOtp('');
    setPassword('');
    setConfirm('');
    setError('');
    setSuccess('');
    setFieldErrors({});
    setCountdown(0);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Link to="/" title="Go to Avelia Homepage">
            <Logo size="md" showTagline={true} />
          </Link>
        </div>

        {/* ───── Step 1 — enter email ───── */}
        {step === 'email' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <IconBubble>🔑</IconBubble>
              <h1 className="auth-title">Forgot Password?</h1>
              <p className="auth-subtitle">
                Enter your registered email address and we will send you a 6-digit code to reset your
                password.
              </p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSendCode} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="fp-email">
                  Registered Email Address
                </label>
                <input
                  id="fp-email"
                  type="email"
                  className={`form-input ${fieldErrors.email ? 'error' : ''}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors({});
                    setError('');
                  }}
                  autoComplete="email"
                  autoFocus
                />
                {fieldErrors.email && <p className="form-error">{fieldErrors.email}</p>}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
                style={{ fontWeight: 800 }}
              >
                {loading ? <Loader size="sm" color="#fff" /> : 'Send Reset Code →'}
              </button>
            </form>
          </>
        )}

        {/* ───── Step 2 — code + new password ───── */}
        {step === 'reset' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <IconBubble>📧</IconBubble>
              <h1 className="auth-title">Reset Your Password</h1>
              <p className="auth-subtitle" style={{ marginBottom: 4 }}>
                If an account exists for this email, we sent a 6-digit code to:
              </p>
              <p
                style={{
                  fontWeight: 800,
                  color: 'var(--color-primary)',
                  fontSize: 'var(--font-size-md)',
                  margin: 0,
                  wordBreak: 'break-all',
                }}
              >
                {email}
              </p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleReset} noValidate>
              <div style={{ marginBottom: '1.5rem' }}>
                <OtpInput value={otp} onChange={setOtp} disabled={loading} error={error ? ' ' : ''} />
              </div>

              <PasswordInput
                label="New Password"
                id="fp-new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((fe) => ({ ...fe, password: '' }));
                  setError('');
                }}
                error={fieldErrors.password}
                hint="Minimum 8 characters with letters & numbers"
                autoComplete="new-password"
              />

              {password.length > 0 && (
                <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.25rem' }}>
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        style={{
                          flex: 1,
                          height: 4,
                          borderRadius: 2,
                          background: n <= strength ? STRENGTH_COLORS[strength] : 'var(--color-border)',
                          transition: 'background 0.3s',
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: STRENGTH_COLORS[strength], margin: 0 }}>
                    Password Strength: {STRENGTH_LABELS[strength]}
                  </p>
                </div>
              )}

              <div style={{ marginTop: '0.75rem', marginBottom: '1.5rem' }}>
                <PasswordInput
                  label="Confirm New Password"
                  id="fp-confirm-password"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    setFieldErrors((fe) => ({ ...fe, confirm: '' }));
                    setError('');
                  }}
                  error={fieldErrors.confirm}
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
                style={{ fontWeight: 800 }}
              >
                {loading ? <Loader size="sm" color="#fff" /> : 'Reset Password →'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              {countdown > 0 ? (
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
                  Resend code in{' '}
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{countdown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {resending ? 'Sending…' : '🔄 Resend Code'}
                </button>
              )}
            </div>

            <p
              style={{
                textAlign: 'center',
                marginTop: '0.75rem',
                marginBottom: 0,
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Wrong email?{' '}
              <button
                type="button"
                onClick={backToEmail}
                style={{
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 'inherit',
                }}
              >
                Change it
              </button>
            </p>
          </>
        )}

        {/* ───── Step 3 — done ───── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center' }}>
            <IconBubble>✅</IconBubble>
            <h1 className="auth-title">Password Updated</h1>
            <p className="auth-subtitle">
              Your password has been reset successfully. Redirecting you to sign in…
            </p>
            <button
              type="button"
              className="btn btn-primary btn-full btn-lg"
              style={{ fontWeight: 800 }}
              onClick={() => navigate('/login', { replace: true })}
            >
              Go to Sign In →
            </button>
          </div>
        )}

        {step !== 'done' && (
          <>
            <hr className="divider" />
            <p
              style={{
                textAlign: 'center',
                margin: 0,
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Remembered it?{' '}
              <Link to="/login" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;