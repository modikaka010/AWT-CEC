import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createScheme, getSchemeById, updateScheme } from '../../../services/adminService';

const SCHEME_CATEGORIES = ['Central', 'State', 'Insurance', 'Credit', 'Subsidy', 'Training', 'Other'];
const AUDIENCE_OPTIONS = ['farmer', 'buyer', 'expert', 'all'];

const INITIAL = {
  name: '', description: '', eligibility: '', benefits: '',
  applicationInfo: '', officialLink: '', image: '',
  category: 'Central', targetAudience: ['farmer'], status: 'draft',
};

const SchemeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await getSchemeById(id);
        const s = res.data.data.scheme;
        setForm({
          name: s.name || '',
          description: s.description || '',
          eligibility: s.eligibility || '',
          benefits: s.benefits || '',
          applicationInfo: s.applicationInfo || '',
          officialLink: s.officialLink || '',
          image: s.image || '',
          category: s.category || 'Central',
          targetAudience: s.targetAudience || ['farmer'],
          status: s.status || 'draft',
        });
      } catch { setError('Failed to load scheme.'); }
      finally { setFetching(false); }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const toggleAudience = (val) => {
    setForm((f) => ({
      ...f,
      targetAudience: f.targetAudience.includes(val)
        ? f.targetAudience.filter((a) => a !== val)
        : [...f.targetAudience, val],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) {
      setError('Name and description are required.');
      return;
    }
    setLoading(true); setError('');
    try {
      if (isEdit) {
        await updateScheme(id, form);
        setSuccessMsg('Scheme updated.');
      } else {
        await createScheme(form);
        setSuccessMsg('Scheme created.');
        setForm(INITIAL);
      }
      setTimeout(() => { setSuccessMsg(''); navigate('/admin/content/schemes'); }, 1500);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save scheme.');
    } finally { setLoading(false); }
  };

  if (fetching) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</div>;

  const TextArea = ({ name, label, rows = 4, placeholder, required }) => (
    <div className="form-group">
      <label className="form-label">{label}{required && <span style={{ color: 'var(--color-error)' }}> *</span>}</label>
      <textarea className="form-input" name={name} rows={rows} value={form[name]} onChange={handleChange} placeholder={placeholder} style={{ resize: 'vertical' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 720 }}>
      <button onClick={() => navigate('/admin/content/schemes')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.25rem' }}>
        ← Back to Schemes
      </button>

      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.75rem' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.2rem', margin: '0 0 0.5rem', color: 'var(--color-text)' }}>
          {isEdit ? '✏️ Edit Scheme' : '🏛️ Add Government Scheme'}
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0 0 1.5rem' }}>
          Avelia provides informational access only and is not affiliated with any government scheme.
        </p>

        {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Scheme Name <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. PM-KISAN Samman Nidhi" />
          </div>

          <TextArea name="description" label="Description" rows={5} placeholder="Full description of the scheme…" required />
          <TextArea name="eligibility" label="Eligibility" rows={3} placeholder="Who can apply for this scheme…" />
          <TextArea name="benefits" label="Benefits" rows={3} placeholder="What beneficiaries receive…" />
          <TextArea name="applicationInfo" label="How to Apply" rows={3} placeholder="Steps to apply, documents required…" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <select className="form-input" name="category" value={form.category} onChange={handleChange}>
                {SCHEME_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Status</label>
              <select className="form-input" name="status" value={form.status} onChange={handleChange}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Official Link</label>
              <input className="form-input" name="officialLink" value={form.officialLink} onChange={handleChange} placeholder="https://pmkisan.gov.in" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Image URL</label>
              <input className="form-input" name="image" value={form.image} onChange={handleChange} placeholder="https://… or /uploads/…" />
            </div>
          </div>

          {/* Target audience */}
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Target Audience</label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              {AUDIENCE_OPTIONS.map((opt) => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                  <input type="checkbox" checked={form.targetAudience.includes(opt)} onChange={() => toggleAudience(opt)} />
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: 130 }}>
              {loading ? 'Saving…' : isEdit ? 'Update Scheme' : 'Create Scheme'}
            </button>
            <button type="button" onClick={() => navigate('/admin/content/schemes')} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchemeForm;
