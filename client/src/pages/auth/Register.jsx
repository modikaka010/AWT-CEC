import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import RoleSelector from '../../components/common/RoleSelector';
import Loader from '../../components/common/Loader';
import Logo from '../../components/common/Logo';
import { sendOtp } from '../../services/authService';

const STEPS = { ROLE: 'role', DETAILS: 'details' };

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'farmer';

  const [step, setStep] = useState(STEPS.ROLE);
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    // Expert-only
    specialization: '',
    qualifications: '',
    experience: '',
    organization: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((fe) => ({ ...fe, [name]: '' }));
    setError('');
  };

  const validateDetails = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Full name is required.';
    if (!form.email.trim()) errors.email = 'Email address is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email address.';
    if (!form.mobile.trim()) errors.mobile = 'Mobile number is required.';
    else if (!/^[6-9]\d{9}$/.test(form.mobile)) errors.mobile = 'Enter a valid 10-digit Indian mobile number.';
    return errors;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const errors = validateDetails();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await sendOtp({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile.trim(),
        role,
      });

      // Pass registration state to verify-otp step
      navigate('/verify-otp', {
        state: {
          email: form.email.trim().toLowerCase(),
          name: form.name.trim(),
          mobile: form.mobile.trim(),
          role,
          expertInfo:
            role === 'expert'
              ? {
                  specialization: form.specialization,
                  qualifications: form.qualifications,
                  experience: form.experience,
                  organization: form.organization,
                }
              : null,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: '2.5rem' }}>
      <div
        style={{
          width: '100%',
          maxWidth: step === STEPS.DETAILS && role === 'expert' ? 560 : 490,
          margin: '0 auto',
        }}
      >
        <div className="auth-card">
          {/* Brand Logo */}
          <div className="auth-logo">
            <Link to="/" title="Go to Avelia Homepage">
              <Logo size="md" showTagline={true} />
            </Link>
          </div>

          {/* Stepper Progress */}
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.75rem' }}>
            {['1. Select Role', '2. Basic Details', '3. OTP & Password'].map((label, i) => {
              const active = (i === 0 && step === STEPS.ROLE) || (i === 1 && step === STEPS.DETAILS);
              const done = i === 0 && step === STEPS.DETAILS;
              return (
                <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      height: 4,
                      borderRadius: 2,
                      marginBottom: '0.35rem',
                      background: active || done ? 'var(--color-primary)' : 'var(--color-border)',
                      transition: 'background 0.3s',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── STEP 1: Choose Role ── */}
          {step === STEPS.ROLE && (
            <>
              <h1 className="auth-title">Create Your Account</h1>
              <p className="auth-subtitle">Select your agricultural role to begin.</p>

              <RoleSelector selected={role} onChange={setRole} />

              <button
                onClick={() => setStep(STEPS.DETAILS)}
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: '1.75rem', fontWeight: 800 }}
              >
                Continue as {role === 'farmer' ? 'Farmer' : role === 'buyer' ? 'Buyer' : 'Agricultural Expert'} →
              </button>

              <p
                style={{
                  textAlign: 'center',
                  marginTop: '1.25rem',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Already registered?{' '}
                <Link to="/login" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  Sign In
                </Link>
              </p>
            </>
          )}

          {/* ── STEP 2: Basic Details ── */}
          {step === STEPS.DETAILS && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <button
                  onClick={() => setStep(STEPS.ROLE)}
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '1.2rem',
                    lineHeight: 1,
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                  }}
                  aria-label="Go back to role selection"
                >
                  ← Back
                </button>
                <h1 className="auth-title" style={{ margin: 0, fontSize: '1.4rem' }}>
                  {role === 'farmer' ? '🌾 Farmer' : role === 'buyer' ? '🛒 Buyer' : '🔬 Agricultural Expert'} Registration
                </h1>
              </div>
              <p className="auth-subtitle">Provide your contact information for instant verification.</p>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSendOtp} noValidate>
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    name="name"
                    className={`form-input ${fieldErrors.name ? 'error' : ''}`}
                    placeholder="e.g. Rajan Kumar"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                    autoFocus
                  />
                  {fieldErrors.name && <p className="form-error">{fieldErrors.name}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`form-input ${fieldErrors.email ? 'error' : ''}`}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                  {fieldErrors.email && <p className="form-error">{fieldErrors.email}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="mobile">Mobile Phone Number *</label>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    inputMode="numeric"
                    className={`form-input ${fieldErrors.mobile ? 'error' : ''}`}
                    placeholder="10-digit mobile number (e.g. 9876543210)"
                    value={form.mobile}
                    onChange={handleChange}
                    maxLength={10}
                    autoComplete="tel"
                  />
                  {fieldErrors.mobile && <p className="form-error">{fieldErrors.mobile}</p>}
                </div>

                {/* Expert-Specific Professional Fields */}
                {role === 'expert' && (
                  <>
                    <hr className="divider" />
                    <p
                      style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        marginBottom: '1rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Professional Credentials
                    </p>

                    <div className="form-group">
                      <label className="form-label" htmlFor="specialization">Area of Specialization</label>
                      <input
                        id="specialization"
                        name="specialization"
                        className="form-input"
                        placeholder="e.g. Plant Pathology, Soil Agronomy, Pest Control"
                        value={form.specialization}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="qualifications">Academic Qualifications</label>
                      <input
                        id="qualifications"
                        name="qualifications"
                        className="form-input"
                        placeholder="e.g. M.Sc. Agriculture (Agronomy), Ph.D."
                        value={form.qualifications}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="experience">Years of Experience</label>
                      <input
                        id="experience"
                        name="experience"
                        className="form-input"
                        placeholder="e.g. 7 years"
                        value={form.experience}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="organization">Organization / University Affiliation</label>
                      <input
                        id="organization"
                        name="organization"
                        className="form-input"
                        placeholder="e.g. ICAR, State Agriculture University, KVK"
                        value={form.organization}
                        onChange={handleChange}
                      />
                    </div>

                    <div
                      style={{
                        background: 'var(--color-info-bg)',
                        border: '1px solid var(--color-info-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.85rem 1rem',
                        marginBottom: '1.25rem',
                        fontSize: '0.82rem',
                        color: 'var(--color-info)',
                      }}
                    >
                      📄 <strong>Expert Notice:</strong> You will upload your degree certificate and
                      verification documents on the password setup step.
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  disabled={loading}
                  style={{ fontWeight: 800, marginTop: '0.75rem' }}
                >
                  {loading ? <Loader size="sm" color="#fff" /> : 'Send Email OTP →'}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
