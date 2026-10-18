import React, { useEffect, useState } from 'react';
import { getAdminProfile, updateAdminProfile } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import StatusBadge from '../../components/admin/StatusBadge';

const Field = ({ label, value }) => (
  <div>
    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.2rem' }}>{label}</p>
    <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem', margin: 0 }}>{value || '—'}</p>
  </div>
);

const AdminProfile = () => {
  const { user: authUser, saveAuth, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit form
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await getAdminProfile();
      const admin = res.data.data.admin;
      setProfile(admin);
      setForm({ name: admin.name || '', mobile: admin.mobile || '' });
    } catch { setError('Failed to load profile.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try {
      const res = await updateAdminProfile({ name: form.name.trim(), mobile: form.mobile.trim() });
      const updated = res.data.data.admin;
      setProfile(updated);
      // Update auth context so the topbar name updates immediately
      saveAuth(token, { ...authUser, name: updated.name, mobile: updated.mobile });
      setSuccessMsg('Profile updated successfully.');
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
        <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>Admin Profile</h2>
      </div>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Avatar + name card */}
      <div style={{ background: 'linear-gradient(135deg, #0f2e0f 0%, #1a6b1a 100%)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.75rem', flexShrink: 0 }}>
          {profile?.name?.[0]?.toUpperCase() || 'A'}
        </div>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: '1.125rem', color: '#fff', margin: 0 }}>{profile?.name}</h3>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', margin: '0.2rem 0 0.5rem' }}>{profile?.email}</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <StatusBadge status="active" size="xs" />
            <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', borderRadius: '9999px', padding: '0.15rem 0.5rem', fontWeight: 600 }}>
              🔧 Administrator
            </span>
          </div>
        </div>
      </div>

      {/* Info card */}
      {!editing ? (
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Account Information</h3>
            <button onClick={() => setEditing(true)} className="btn btn-secondary btn-sm">✏️ Edit</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', padding: '1rem', background: 'var(--color-off-white)', borderRadius: 'var(--radius-md)' }}>
            <Field label="Full Name"   value={profile?.name} />
            <Field label="Email"       value={profile?.email} />
            <Field label="Mobile"      value={profile?.mobile} />
            <Field label="Login ID"    value={profile?.loginId} />
            <Field label="Role"        value="Administrator" />
            <Field label="Status"      value={<StatusBadge status={profile?.status} />} />
            <Field label="Member Since" value={fmtDate(profile?.createdAt)} />
          </div>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 1.25rem' }}>Edit Profile</h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full Name <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <input className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile</label>
              <input className="form-input" value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} placeholder="10-digit mobile" />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm" style={{ minWidth: 100 }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => { setEditing(false); setError(''); }} className="btn btn-secondary btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Non-editable info */}
      <div style={{ background: 'var(--color-off-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem' }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
          ℹ️ Email and Login ID cannot be changed. To update your password, go to <strong>Settings</strong>.
        </p>
      </div>
    </div>
  );
};

export default AdminProfile;
