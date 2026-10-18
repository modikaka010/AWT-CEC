import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import PasswordInput from '../../components/common/PasswordInput';
import Loader from '../../components/common/Loader';
import Logo from '../../components/common/Logo';
import { useAuth } from '../../hooks/useAuth';
import { register, registerExpert } from '../../services/authService';
import { getRoleRedirect } from '../../routes/roleRedirect';

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

// Expert Document Upload Component
const DocumentUpload = ({ files, onChange, error }) => (
  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
    <label className="form-label">
      <span>Upload Qualification Certificates *</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>PDF, JPG, PNG</span>
    </label>
    <div
      style={{
        border: `2px dashed ${error ? 'var(--color-error)' : 'var(--color-border-strong)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        background: 'var(--color-bg)',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'var(--transition)',
      }}
      onClick={() => document.getElementById('doc-upload').click()}
    >
      <input
        id="doc-upload"
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png"
        style={{ display: 'none' }}
        onChange={(e) => onChange(Array.from(e.target.files))}
      />
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📑</div>
      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary-dark)', margin: 0 }}>
        Click to select files or drag certificates here
      </p>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0.35rem 0 0' }}>
        Degree certificate, experience letters, or professional council IDs (Max 5MB/file)
      </p>
    </div>
    {files.length > 0 && (
      <ul style={{ listStyle: 'none', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {files.map((f, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              background: 'var(--color-primary-muted)',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span>📎 {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(files.filter((_, fi) => fi !== i));
              }}
              style={{ color: 'var(--color-error)', fontWeight: 700, padding: 0 }}
            >
              ✕ Remove
            </button>
          </li>
        ))}
      </ul>
    )}
    {error && <p className="form-error">{error}</p>}
  </div>
);

const SetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;
  const { saveAuth } = useAuth();

  useEffect(() => {
    if (!state?.email || !state?.otpVerified) navigate('/register', { replace: true });
  }, [state, navigate]);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const strength = passwordStrength(password);

  const validate = () => {
    const errors = {};
    if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
    if (password !== confirm) errors.confirm = 'Passwords do not match.';
    if (state?.role === 'expert' && files.length === 0)
      errors.files = 'Please upload at least one qualification document.';
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
      if (state.role === 'expert') {
        const fd = new FormData();
        fd.append('name', state.name);
        fd.append('email', state.email);
        fd.append('mobile', state.mobile);
        fd.append('password', password);
        if (state.expertInfo) {
          Object.entries(state.expertInfo).forEach(([k, v]) => {
            if (v) fd.append(k, v);
          });
        }
        files.forEach((f) => fd.append('documents', f));
        await registerExpert(fd);

        // Expert → pending verification screen
        navigate('/pending-verification', {
          replace: true,
          state: { name: state.name, email: state.email },
        });
        return;
      } else {
        const result = await register({
          name: state.name,
          email: state.email,
          mobile: state.mobile,
          role: state.role,
          password,
        });
        // Auto-login for farmer/buyer
        saveAuth(result.data.token, result.data.user);
        navigate(getRoleRedirect(result.data.user), { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!state?.email) return null;

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: '2.5rem' }}>
      <div style={{ width: '100%', maxWidth: 500, margin: '0 auto' }}>
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
              {state?.role === 'expert' ? '🔬' : '🔑'}
            </div>
            <h1 className="auth-title">
              {state?.role === 'expert' ? 'Complete Expert Setup' : 'Set Your Secure Password'}
            </h1>
            <p className="auth-subtitle" style={{ marginBottom: 0 }}>
              {state?.role === 'expert'
                ? 'Upload your qualifications and configure account access.'
                : 'Create a password to access your Avelia dashboard.'}
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {/* Expert documents upload */}
            {state?.role === 'expert' && (
              <DocumentUpload files={files} onChange={setFiles} error={fieldErrors.files} />
            )}

            <PasswordInput
              label="New Password *"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((fe) => ({ ...fe, password: '' }));
              }}
              error={fieldErrors.password}
              hint="Minimum 8 characters with letters & numbers"
              autoComplete="new-password"
            />

            {/* Strength Bar */}
            {password.length > 0 && (
              <div style={{ marginTop: '-0.25rem', marginBottom: '1rem' }}>
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

            <div style={{ marginTop: '0.75rem' }}>
              <PasswordInput
                label="Confirm Password *"
                id="confirm"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setFieldErrors((fe) => ({ ...fe, confirm: '' }));
                }}
                error={fieldErrors.confirm}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: '1.5rem', fontWeight: 800 }}
              disabled={loading}
            >
              {loading ? (
                <Loader size="sm" color="#fff" />
              ) : state?.role === 'expert' ? (
                'Submit Application for Review →'
              ) : (
                'Finish & Access Portal →'
              )}
            </button>
          </form>

          <p
            style={{
              textAlign: 'center',
              marginTop: '1.25rem',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
