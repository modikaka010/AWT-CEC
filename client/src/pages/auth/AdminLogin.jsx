import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/common/PasswordInput';
import Loader from '../../components/common/Loader';
import Logo from '../../components/common/Logo';
import { useAuth } from '../../hooks/useAuth';
import { adminLogin } from '../../services/authService';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { saveAuth, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Both fields are required.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await adminLogin({ identifier: identifier.trim(), password });
      saveAuth(result.data.token, result.data.user);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ background: '#0E3326' }}>
      <div className="auth-card" style={{ borderColor: 'rgba(255,255,255,0.15)', background: '#FFFFFF' }}>
        {/* Logo */}
        <div className="auth-logo">
          <Link to="/" title="Go to Avelia Homepage">
            <Logo size="md" showTagline={true} />
          </Link>
        </div>

        {/* Shield Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--color-primary-muted)',
              border: '2px solid var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              margin: '0 auto 0.75rem',
            }}
          >
            🛡️
          </div>
          <h1 className="auth-title">Administrative Portal</h1>
          <p className="auth-subtitle">Restricted access for authorized platform personnel only.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-identifier">
              Admin Email or Login ID
            </label>
            <input
              id="admin-identifier"
              type="text"
              className="form-input"
              placeholder="e.g. admin@avelia.agri or AV-A-00001"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError('');
              }}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <PasswordInput
              label="Admin Password"
              id="admin-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ fontWeight: 800 }}
          >
            {loading ? <Loader size="sm" color="#fff" /> : 'Enter Admin Console →'}
          </button>
        </form>

        <div
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-warning-bg)',
            border: '1px solid var(--color-warning-border)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-warning)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          🔒 <strong>Security Notice:</strong> All administrative access sessions are encrypted and
          audit-logged.
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
