import React, { useState } from 'react';
import { changePassword } from '../../services/expertService';

const ExpertSettings = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({ current: false, new: false, confirm: false });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg('');
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('All fields are required.'); return;
    }
    if (form.newPassword.length < 8) {
      setError('New password must be at least 8 characters.'); return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.'); return;
    }
    if (form.newPassword === form.currentPassword) {
      setError('New password must be different from the current one.'); return;
    }
    setLoading(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccessMsg('Password changed successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to change password.');
    } finally { setLoading(false); }
  };

  const PwInput = ({ name, label, showKey }) => (
    <div className="form-group">
      <label className="form-label">{label} <span style={{ color: 'var(--color-error)' }}>*</span></label>
      <div style={{ position: 'relative' }}>
        <input
          className="form-input"
          type={show[showKey] ? 'text' : 'password'}
          name={name}
          value={form[name]}
          onChange={handleChange}
          style={{ paddingRight: '2.5rem' }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => ({ ...s, [showKey]: !s[showKey] }))}
          style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem' }}
          aria-label={show[showKey] ? 'Hide' : 'Show'}
        >
          {show[showKey] ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  );

  // Password strength rules
  const rules = [
    { ok: form.newPassword.length >= 8,          label: 'At least 8 characters' },
    { ok: /[A-Z]/.test(form.newPassword),         label: 'One uppercase letter' },
    { ok: /[0-9]/.test(form.newPassword),         label: 'One number' },
    { ok: /[^A-Za-z0-9]/.test(form.newPassword),  label: 'One special character' },
  ];

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>⚙️</span>
        <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>Settings</h2>
      </div>

      {/* Change Password */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 0.375rem' }}>🔑 Change Password</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0 0 1.25rem' }}>
          Choose a strong password of at least 8 characters.
        </p>

        {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <PwInput name="currentPassword" label="Current Password" showKey="current" />
          <PwInput name="newPassword"     label="New Password"     showKey="new" />
          <PwInput name="confirmPassword" label="Confirm Password" showKey="confirm" />

          {form.newPassword.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              {rules.map((r) => (
                <p key={r.label} style={{ fontSize: '0.75rem', color: r.ok ? 'var(--color-success)' : 'var(--color-text-muted)', margin: '0.1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {r.ok ? '✅' : '○'} {r.label}
                </p>
              ))}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: 160, background: '#1565c0', borderColor: '#1565c0' }}>
            {loading ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 1rem' }}>ℹ️ Account Information</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            { label: 'Platform',   value: 'Avelia – Farm to Market Platform' },
            { label: 'Role',       value: 'Agricultural Expert' },
            { label: 'Auth',       value: 'JWT (7-day session)' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{label}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Security note */}
      <div style={{ background: 'var(--color-error-bg)', border: '1px solid #f5c6c3', borderRadius: 'var(--radius-xl)', padding: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-error)', margin: '0 0 0.375rem' }}>⚠️ Security Note</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', margin: 0, lineHeight: 1.6 }}>
          Never share your credentials. Always log out from shared devices. If you suspect unauthorized access, change your password immediately.
        </p>
      </div>
    </div>
  );
};

export default ExpertSettings;
