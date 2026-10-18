import React, { useState } from 'react';
import { changeAdminPassword } from '../../services/adminService';

const AdminSettings = () => {
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm((f) => ({ ...f, [name]: value }));
    setPwError('');
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');

    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwError('All fields are required.'); return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError('New password must be at least 8 characters.'); return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match.'); return;
    }
    if (pwForm.newPassword === pwForm.currentPassword) {
      setPwError('New password must be different from the current one.'); return;
    }

    setPwLoading(true);
    try {
      await changeAdminPassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwSuccess('Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwSuccess(''), 4000);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password.');
    } finally { setPwLoading(false); }
  };

  const PwInput = ({ name, label, placeholder, showKey }) => (
    <div className="form-group">
      <label className="form-label">{label} <span style={{ color: 'var(--color-error)' }}>*</span></label>
      <div style={{ position: 'relative' }}>
        <input
          className="form-input"
          type={showPw[showKey] ? 'text' : 'password'}
          name={name}
          value={pwForm[name]}
          onChange={handlePwChange}
          placeholder={placeholder}
          style={{ paddingRight: '2.5rem' }}
        />
        <button
          type="button"
          onClick={() => setShowPw((s) => ({ ...s, [showKey]: !s[showKey] }))}
          style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem' }}
          aria-label={showPw[showKey] ? 'Hide password' : 'Show password'}
        >
          {showPw[showKey] ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  );

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

        {pwSuccess && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{pwSuccess}</div>}
        {pwError   && <div className="alert alert-error"   style={{ marginBottom: '1rem' }}>{pwError}</div>}

        <form onSubmit={handlePwSubmit}>
          <PwInput name="currentPassword" label="Current Password" placeholder="Enter current password" showKey="current" />
          <PwInput name="newPassword"     label="New Password"     placeholder="Minimum 8 characters"   showKey="new" />
          <PwInput name="confirmPassword" label="Confirm Password" placeholder="Repeat new password"     showKey="confirm" />

          {/* Password strength hint */}
          {pwForm.newPassword.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              {[
                { ok: pwForm.newPassword.length >= 8,          label: 'At least 8 characters' },
                { ok: /[A-Z]/.test(pwForm.newPassword),         label: 'One uppercase letter' },
                { ok: /[0-9]/.test(pwForm.newPassword),         label: 'One number' },
                { ok: /[^A-Za-z0-9]/.test(pwForm.newPassword),  label: 'One special character' },
              ].map((rule) => (
                <p key={rule.label} style={{ fontSize: '0.75rem', color: rule.ok ? 'var(--color-success)' : 'var(--color-text-muted)', margin: '0.1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {rule.ok ? '✅' : '○'} {rule.label}
                </p>
              ))}
            </div>
          )}

          <button type="submit" disabled={pwLoading} className="btn btn-primary" style={{ minWidth: 150 }}>
            {pwLoading ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Platform info (read-only) */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 1rem' }}>ℹ️ Platform Information</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            { label: 'Platform',   value: 'Avelia – Farm to Market Platform' },
            { label: 'Version',    value: '2.0.0' },
            { label: 'Stack',      value: 'React + Node.js + MongoDB' },
            { label: 'Auth',       value: 'JWT + bcrypt' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{label}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ background: 'var(--color-error-bg)', border: '1px solid #f5c6c3', borderRadius: 'var(--radius-xl)', padding: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-error)', margin: '0 0 0.375rem' }}>⚠️ Security Note</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', margin: 0, lineHeight: 1.6 }}>
          Never share your admin credentials. Always log out from shared computers. JWT sessions expire in 7 days.
        </p>
      </div>
    </div>
  );
};

export default AdminSettings;
