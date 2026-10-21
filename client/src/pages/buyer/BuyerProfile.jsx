import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../../services/buyerService';
import { useAuth } from '../../hooks/useAuth';
import StatusBadge from '../../components/admin/StatusBadge';

const Field = ({ label, value }) => (
  <div>
    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.2rem' }}>{label}</p>
    <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem', margin: 0 }}>{value || '—'}</p>
  </div>
);

const BuyerProfile = () => {
  const { user: authUser, saveAuth, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '' });

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await getProfile();
      const b = res.data.data.buyer;
      setProfile(b);
      setForm({ name: b.name || '', mobile: b.mobile || '' });
    } catch { setError('Failed to load profile.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try {
      const res = await updateProfile({ name: form.name.trim(), mobile: form.mobile.trim() });
      const updated = res.data.data.buyer;
      setProfile(updated);
      saveAuth(token, { ...authUser, name: updated.name, mobile: updated.mobile });
      setSuccessMsg('Profile updated.');
      setTimeout(() => setSuccessMsg(''), 3000);
      setEditing(false);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update profile.');
    } finally { setSaving(false); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>👤</span>
        <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>My Profile</h2>
      </div>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Hero card */}
      <div style={{ background: 'linear-gradient(135deg, #2e1a00 0%, #c4840e 100%)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', color: '#fff', flexWrap: 'wrap' }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.75rem', flexShrink: 0 }}>
          {profile?.name?.[0]?.toUpperCase() || 'B'}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>{profile?.name}</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', margin: '0.2rem 0 0.5rem' }}>{profile?.email}</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <StatusBadge status={profile?.status} size="xs" />
            <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', borderRadius: '9999px', padding: '0.15rem 0.5rem', fontWeight: 600 }}>
              🛒 {profile?.loginId}
            </span>
          </div>
        </div>
      </div>

      {/* Info / Edit */}
      {!editing ? (
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Account Information</h3>
            <button onClick={() => setEditing(true)} className="btn btn-secondary btn-sm">✏️ Edit</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', background: 'var(--color-off-white)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <Field label="Full Name"    value={profile?.name} />
            <Field label="Email"        value={profile?.email} />
            <Field label="Mobile"       value={profile?.mobile} />
            <Field label="Login ID"     value={profile?.loginId} />
            <Field label="Role"         value="Buyer" />
            <Field label="Member Since" value={fmtDate(profile?.createdAt)} />
          </div>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 1.25rem' }}>Edit Profile</h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full Name <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <input className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile</label>
              <input className="form-input" value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} placeholder="10-digit mobile number" />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={saving} className="btn btn-sm" style={{ minWidth: 120, background: '#c4840e', color: '#fff', borderColor: '#c4840e' }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => { setEditing(false); setError(''); }} className="btn btn-secondary btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'var(--color-off-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem' }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
          ℹ️ Email and Login ID cannot be changed. To update your password, go to <strong>Settings</strong>.
        </p>
      </div>
    </div>
  );
};

export default BuyerProfile;
