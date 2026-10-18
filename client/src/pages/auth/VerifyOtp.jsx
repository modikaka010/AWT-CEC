import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import OtpInput from '../../components/common/OtpInput';
import Loader from '../../components/common/Loader';
import Logo from '../../components/common/Logo';
import { verifyOtp, resendOtp } from '../../services/authService';

const RESEND_COOLDOWN = 30; // seconds

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  // Guard — if accessed directly without state, redirect back
  useEffect(() => {
    if (!state?.email) navigate('/register', { replace: true });
  }, [state, navigate]);

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await verifyOtp({ email: state.email, otp });
      // Navigate to SetPassword, carrying all registration data forward
      navigate('/set-password', { state: { ...state, otpVerified: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
      setOtp('');
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
      await resendOtp(state.email);
      setSuccess('A new 6-digit OTP has been dispatched to your email.');
      setCountdown(RESEND_COOLDOWN);
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  if (!state?.email) return null;

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand Logo */}
        <div className="auth-logo">
          <Link to="/" title="Go to Avelia Homepage">
            <Logo size="md" showTagline={true} />
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
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
            📧
          </div>
          <h1 className="auth-title">Verify Email Address</h1>
          <p className="auth-subtitle" style={{ marginBottom: 4 }}>
            Enter the 6-digit authentication code sent to:
          </p>
          <p
            style={{
              fontWeight: 800,
              color: 'var(--color-primary)',
              fontSize: 'var(--font-size-md)',
              margin: 0,
            }}
          >
            {state.email}
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: '1.75rem' }}>
            <OtpInput value={otp} onChange={setOtp} disabled={loading} error={error ? ' ' : ''} />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading || otp.length < 6}
            style={{ fontWeight: 800 }}
          >
            {loading ? <Loader size="sm" color="#fff" /> : 'Confirm OTP →'}
          </button>
        </form>

        {/* Resend */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          {countdown > 0 ? (
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              Resend code in{' '}
              <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{countdown}s</span>
            </p>
          ) : (
            <button
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
              {resending ? 'Sending…' : '🔄 Resend Verification Code'}
            </button>
          )}
        </div>

        <p
          style={{
            textAlign: 'center',
            marginTop: '1rem',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Incorrect email address?{' '}
          <Link to="/register" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
            Edit Details
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;
