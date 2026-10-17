import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../../services/expertService';
import { useAuth } from '../../hooks/useAuth';
import StatusBadge from '../../components/admin/StatusBadge';

const Field = ({ label, value }) => (
  <div>
    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.2rem' }}>{label}</p>
    <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem', margin: 0 }}>{value || '—'}</p>
  </div>
);

const ExpertProfile = () => {
  const { user: authUser, saveAuth, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', mobile: '',
    bio: '', languages: '',
    specialization: '', qualifications: '', experience: '', organization: '',
  });

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await getProfile();
      const exp = res.data.data.expert;
      setProfile(exp);
      setForm({
        name: exp.name || '',
        mobile: exp.mobile || '',
        bio: exp.expertInfo?.bio || '',
        languages: exp.expertInfo?.languages || '',
        specialization: exp.expertInfo?.specialization || '',
        qualifications: exp.expertInfo?.qualifications || '',
        experience: exp.expertInfo?.experience || '',
        organization: exp.expertInfo?.organization || '',
      });
    } catch { setError('Failed to load profile.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        bio: form.bio,
        languages: form.languages,
        expertInfo: {
          specialization: form.specialization,
          qualifications: form.qualifications,
          experience: form.experience,
          organization: form.organization,
        },
      };
      const res = await updateProfile(payload);
      const updated = res.data.data.expert;
      setProfile(updated);
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
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>👤</span>
        <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>Expert Profile</h2>
      </div>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Hero card */}
      <div style={{ background: 'linear-gradient(135deg, #0d1b35 0%, #1565c0 100%)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', color: '#fff', flexWrap: 'wrap' }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.75rem', flexShrink: 0 }}>
          {profile?.name?.[0]?.toUpperCase() || 'E'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>{profile?.name}</h3>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', margin: '0.2rem 0 0.5rem' }}>
            {profile?.expertInfo?.specialization || 'Agricultural Expert'}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <StatusBadge status={profile?.status} size="xs" />
            <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', borderRadius: '9999px', padding: '0.15rem 0.5rem', fontWeight: 600 }}>
              🔬 {profile?.loginId}
            </span>
          </div>
        </div>
      </div>

      {/* Verification documents section */}
      {profile?.expertInfo?.documentUrls?.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.875rem' }}>📄 Verification Documents</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {profile.expertInfo.documentUrls.map((url, i) => (
              <a key={i} href={`http://localhost:5000${url}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                📋 Document {i + 1}
              </a>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem', marginBottom: 0 }}>
            Verification documents are not publicly visible. Contact admin to update documents.
          </p>
        </div>
      )}

      {/* Profile info / edit */}
      {!editing ? (
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Account & Professional Information</h3>
            <button onClick={() => setEditing(true)} className="btn btn-secondary btn-sm">✏️ Edit</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', background: 'var(--color-off-white)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <Field label="Full Name"       value={profile?.name} />
            <Field label="Email"           value={profile?.email} />
            <Field label="Mobile"          value={profile?.mobile} />
            <Field label="Login ID"        value={profile?.loginId} />
            <Field label="Specialization"  value={profile?.expertInfo?.specialization} />
            <Field label="Qualifications"  value={profile?.expertInfo?.qualifications} />
            <Field label="Experience"      value={profile?.expertInfo?.experience} />
            <Field label="Organization"    value={profile?.expertInfo?.organization} />
            <Field label="Languages"       value={profile?.expertInfo?.languages} />
            <Field label="Member Since"    value={fmtDate(profile?.createdAt)} />
          </div>
          {profile?.expertInfo?.bio && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Bio</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.7, background: 'var(--color-off-white)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', margin: 0 }}>
                {profile.expertInfo.bio}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 1.25rem' }}>Edit Profile</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input className="form-input" name="name" value={form.name} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mobile</label>
                <input className="form-input" name="mobile" value={form.mobile} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Specialization</label>
                <input className="form-input" name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Crop Science" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Qualifications</label>
                <input className="form-input" name="qualifications" value={form.qualifications} onChange={handleChange} placeholder="e.g. M.Sc. Agriculture" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Experience</label>
                <input className="form-input" name="experience" value={form.experience} onChange={handleChange} placeholder="e.g. 5 Years" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Organization</label>
                <input className="form-input" name="organization" value={form.organization} onChange={handleChange} placeholder="e.g. ICAR" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Languages</label>
                <input className="form-input" name="languages" value={form.languages} onChange={handleChange} placeholder="e.g. Hindi, English, Gujarati" />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Professional Bio</label>
              <textarea className="form-input" name="bio" rows={4} value={form.bio} onChange={handleChange} placeholder="Brief professional background…" style={{ resize: 'vertical' }} />
            </div>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#92400e' }}>
              ℹ️ Significant changes to professional information may require admin re-verification. Email and Login ID cannot be changed.
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm" style={{ minWidth: 120, background: '#1565c0', borderColor: '#1565c0' }}>
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

export default ExpertProfile;
