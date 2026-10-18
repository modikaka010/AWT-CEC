import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDiseaseCaseById, updateDiseaseCase } from '../../../services/expertService';
import StatusBadge from '../../../components/admin/StatusBadge';

const Field = ({ label, value }) => (
  <div>
    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.2rem' }}>{label}</p>
    <p style={{ fontWeight: 500, color: 'var(--color-text)', fontSize: '0.875rem', margin: 0 }}>{value || '—'}</p>
  </div>
);

const TextArea = ({ label, name, value, onChange, placeholder, rows = 4 }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <textarea className="form-input" name={name} rows={rows} value={value} onChange={onChange}
      placeholder={placeholder} style={{ resize: 'vertical' }} />
  </div>
);

const INITIAL_FORM = {
  status: '', possibleDisease: '', diagnosis: '',
  treatment: '', precautions: '', followUp: '',
};

const DiseaseCaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diseaseCase, setDiseaseCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await getDiseaseCaseById(id);
      const dc = res.data.data.diseaseCase;
      setDiseaseCase(dc);
      if (dc.expertAdvice) {
        setForm({
          status: dc.status || '',
          possibleDisease: dc.expertAdvice.possibleDisease || '',
          diagnosis: dc.expertAdvice.diagnosis || '',
          treatment: dc.expertAdvice.treatment || '',
          precautions: dc.expertAdvice.precautions || '',
          followUp: dc.expertAdvice.followUp || '',
        });
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load disease case.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setFormError('');
    try {
      await updateDiseaseCase(id, form);
      setSuccessMsg('Disease case updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
      load();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to update disease case.');
    } finally { setSubmitting(false); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</div>;
  if (!diseaseCase) return <div className="alert alert-error">{error || 'Case not found.'}</div>;

  const canEdit = diseaseCase.status !== 'closed';

  return (
    <div style={{ maxWidth: 780 }}>
      <button onClick={() => navigate('/expert/disease')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1565c0', fontWeight: 600, fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.25rem' }}>
        ← Back to Disease Cases
      </button>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Header */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>🌾 {diseaseCase.cropName}</h2>
            {diseaseCase.plantPart && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', margin: '0.25rem 0 0' }}>Affected part: {diseaseCase.plantPart}</p>}
          </div>
          <StatusBadge status={diseaseCase.status} size="md" />
        </div>
      </div>

      {/* Farmer info */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>👨‍🌾 Farmer Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem' }}>
          <Field label="Name"      value={diseaseCase.farmer?.name} />
          <Field label="Email"     value={diseaseCase.farmer?.email} />
          <Field label="Mobile"    value={diseaseCase.farmer?.mobile} />
          <Field label="Login ID"  value={diseaseCase.farmer?.loginId} />
          <Field label="Submitted" value={fmtDate(diseaseCase.createdAt)} />
          {diseaseCase.farmLocation && <Field label="Location" value={diseaseCase.farmLocation} />}
        </div>
      </div>

      {/* Symptoms */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>🔍 Reported Symptoms</h3>
        <div style={{ background: '#fef9ec', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '0.875rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.7, margin: 0 }}>{diseaseCase.symptoms}</p>
        </div>
        {diseaseCase.description && (
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Additional Description</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.7, background: 'var(--color-off-white)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', margin: 0 }}>
              {diseaseCase.description}
            </p>
          </div>
        )}
      </div>

      {/* Images */}
      {diseaseCase.images?.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>📷 Uploaded Images</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {diseaseCase.images.map((img, i) => (
              <a key={i} href={`http://localhost:5000${img}`} target="_blank" rel="noopener noreferrer">
                <img src={`http://localhost:5000${img}`} alt={`img${i}`} style={{ width: 130, height: 130, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  onError={(e) => { e.target.style.display = 'none'; }} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Expert diagnosis form */}
      {canEdit && (
        <div style={{ background: '#fff', border: '2px solid #1565c0', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1565c0', marginBottom: '0.5rem' }}>🔬 Expert Diagnosis & Advice</h3>
          <div style={{ background: '#fffbeb', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#92400e' }}>
            ⚠️ This advice is agricultural guidance only. It is not a guaranteed scientific diagnosis.
          </div>

          {formError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{formError}</div>}

          <form onSubmit={handleSubmit}>
            {/* Status */}
            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select className="form-input" name="status" value={form.status} onChange={handleChange}>
                <option value="">— Keep Current —</option>
                <option value="under_review">Under Review</option>
                <option value="diagnosed">Diagnosed</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <TextArea label="Possible Disease / Condition" name="possibleDisease" value={form.possibleDisease} onChange={handleChange} placeholder="e.g. Powdery mildew, Leaf blight…" rows={2} />
            <TextArea label="Diagnosis / Observation" name="diagnosis" value={form.diagnosis} onChange={handleChange} placeholder="Your detailed observation and assessment…" />
            <TextArea label="Treatment / Management" name="treatment" value={form.treatment} onChange={handleChange} placeholder="Recommended treatment or management steps…" />
            <TextArea label="Precautions" name="precautions" value={form.precautions} onChange={handleChange} placeholder="Things to avoid, safety measures…" rows={3} />
            <TextArea label="Follow-up Instructions" name="followUp" value={form.followUp} onChange={handleChange} placeholder="Signs to watch for, when to re-check…" rows={3} />

            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ minWidth: 160, background: '#1565c0', borderColor: '#1565c0' }}>
              {submitting ? 'Saving…' : '💾 Save Advice'}
            </button>
          </form>
        </div>
      )}

      {/* Read-only advice view for closed cases */}
      {!canEdit && diseaseCase.expertAdvice?.diagnosis && (
        <div style={{ background: '#edf7ed', border: '1px solid #b2dfb2', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1a7a1a', marginBottom: '1rem' }}>✅ Expert Advice (Submitted)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {diseaseCase.expertAdvice.possibleDisease && <Field label="Possible Disease" value={diseaseCase.expertAdvice.possibleDisease} />}
            <Field label="Diagnosis" value={diseaseCase.expertAdvice.diagnosis} />
            {diseaseCase.expertAdvice.treatment && <Field label="Treatment" value={diseaseCase.expertAdvice.treatment} />}
            {diseaseCase.expertAdvice.precautions && <Field label="Precautions" value={diseaseCase.expertAdvice.precautions} />}
            {diseaseCase.expertAdvice.followUp && <Field label="Follow-up" value={diseaseCase.expertAdvice.followUp} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseCaseDetail;
