import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/common/PasswordInput';
import Loader from '../../components/common/Loader';
import Logo from '../../components/common/Logo';
import { useAuth } from '../../hooks/useAuth';
import { login } from '../../services/authService';
import { getRoleRedirect } from '../../routes/roleRedirect';

const Login = () => {
  const navigate = useNavigate();
  const { saveAuth, isAuthenticated, user } = useAuth();

  // Redirect already-authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRoleRedirect(user), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!identifier.trim()) errors.identifier = 'Email or Login ID is required.';
    if (!password) errors.password = 'Password is required.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await login({ identifier: identifier.trim(), password });
      const { token, user: loggedInUser } = result.data;

      // Handle expert pending/rejected before saving auth
      if (loggedInUser.role === 'expert' && loggedInUser.status === 'pending') {
        navigate('/pending-verification', {
          state: { name: loggedInUser.name, email: loggedInUser.email },
          replace: true,
        });
        return;
      }

      if (loggedInUser.role === 'expert' && loggedInUser.status === 'rejected') {
        setError('Your expert application was rejected. Please contact support for more information.');
        setLoading(false);
        return;
      }

      saveAuth(token, loggedInUser);
      navigate(getRoleRedirect(loggedInUser), { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      if (err.response?.data?.data?.status === 'rejected') {
        setError(`Your expert application was rejected. ${err.response.data.data.reason || ''}`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand Logo */}
        <div className="auth-logo">
          <Link to="/" title="Go to Avelia Homepage">
            <Logo size="md" showTagline={true} />
          </Link>
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your Avelia agricultural portal.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="identifier">
              Email Address or Login ID
            </label>
            <input
              id="identifier"
              type="text"
              className={`form-input ${fieldErrors.identifier ? 'error' : ''}`}
              placeholder="e.g. you@example.com or AV-F-00001"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setFieldErrors((fe) => ({ ...fe, identifier: '' }));
                setError('');
              }}
              autoComplete="username"
              autoFocus
            />
            {fieldErrors.identifier && <p className="form-error">{fieldErrors.identifier}</p>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <PasswordInput
              label="Password"
              id="login-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((fe) => ({ ...fe, password: '' }));
                setError('');
              }}
              error={fieldErrors.password}
              autoComplete="current-password"
            />
            <div style={{ textAlign: 'right', marginTop: '0.55rem' }}>
              <Link
                to="/forgot-password"
                style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-primary)' }}
                >
                Forgot password?
              </Link>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ fontWeight: 800 }}>
            {loading ? <Loader size="sm" color="#fff" /> : 'Sign In →'}
          </button>
        </form>

        <hr className="divider" />

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
              Create Account
            </Link>
          </p>

          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
            Are you a platform administrator?{' '}
            <Link to="/admin-login" style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
              Admin Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
