import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConsultationById, completeConsultation } from '../../../services/expertService';
import StatusBadge from '../../../components/admin/StatusBadge';

const Field = ({ label, value }) => (
  <div>
    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.2rem' }}>{label}</p>
    <p style={{ fontWeight: 500, color: 'var(--color-text)', fontSize: '0.875rem', margin: 0 }}>{value || '—'}</p>
  </div>
);

const TextArea = ({ label, name, value, onChange, placeholder, rows = 4, required }) => (
  <div className="form-group">
    <label className="form-label">
      {label}{required && <span style={{ color: 'var(--color-error)' }}> *</span>}
    </label>
    <textarea
      className="form-input"
      name={name}
      rows={rows}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ resize: 'vertical' }}
    />
  </div>
);

const INITIAL_FORM = { diagnosis: '', advice: '', recommendedActions: '', precautions: '', followUp: '' };

const ConsultationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await getConsultationById(id);
      const c = res.data.data.consultation;
      setConsultation(c);
      // Pre-fill if already has response
      if (c.expertResponse?.advice) {
        setForm({
          diagnosis: c.expertResponse.diagnosis || '',
          advice: c.expertResponse.advice || '',
          recommendedActions: c.expertResponse.recommendedActions || '',
          precautions: c.expertResponse.precautions || '',
          followUp: c.expertResponse.followUp || '',
        });
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load consultation.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.advice.trim()) { setFormError('Expert advice is required.'); return; }
    setSubmitting(true); setFormError('');
    try {
      await completeConsultation(id, form);
      setSuccessMsg('Consultation completed successfully! The farmer has been notified.');
      load();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to complete consultation.');
    } finally { setSubmitting(false); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
  const isActive = consultation?.status === 'accepted';
  const isCompleted = consultation?.status === 'completed';

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</div>;
  if (!consultation) return <div className="alert alert-error">{error || 'Consultation not found.'}</div>;

  return (
    <div style={{ maxWidth: 780 }}>
      <button onClick={() => navigate('/expert/consultations')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1565c0', fontWeight: 600, fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.25rem' }}>
        ← Back to My Consultations
      </button>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Header */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>{consultation.problemTitle}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <StatusBadge status={consultation.status} size="md" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: '#e8f0fe', color: '#1565c0' }}>
                🌾 {consultation.cropName}
              </span>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{fmtDate(consultation.createdAt)}</p>
        </div>
      </div>

      {/* Farmer info */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>👨‍🌾 Farmer Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          <Field label="Name"          value={consultation.farmer?.name} />
          <Field label="Email"         value={consultation.farmer?.email} />
          <Field label="Mobile"        value={consultation.farmer?.mobile} />
          <Field label="Login ID"      value={consultation.farmer?.loginId} />
          {consultation.farmLocation && <Field label="Farm Location" value={consultation.farmLocation} />}
        </div>
        <button onClick={() => navigate(`/expert/farmers/${consultation.farmer?._id}`)} className="btn btn-secondary btn-sm" style={{ marginTop: '0.875rem' }}>
          View Farmer History →
        </button>
      </div>

      {/* Problem */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>🌿 Farmer's Problem</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Description</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.7, background: 'var(--color-off-white)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', margin: 0 }}>
              {consultation.description}
            </p>
          </div>
          {consultation.symptoms && (
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Symptoms</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.7, background: 'var(--color-off-white)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', margin: 0 }}>
                {consultation.symptoms}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Images */}
      {consultation.images?.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>📷 Farmer's Images</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {consultation.images.map((img, i) => (
              <a key={i} href={`http://localhost:5000${img}`} target="_blank" rel="noopener noreferrer">
                <img src={`http://localhost:5000${img}`} alt={`img${i}`} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  onError={(e) => { e.target.style.display = 'none'; }} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Advice Form — active consultations */}
      {isActive && (
        <div style={{ background: '#fff', border: '2px solid #1565c0', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', color: '#1565c0' }}>✍️ Provide Expert Advice</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Fill in your diagnosis and recommendations. Submitting this will complete the consultation and notify the farmer.
          </p>

          {formError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{formError}</div>}

          <form onSubmit={handleSubmit}>
            <TextArea label="Diagnosis / Observation" name="diagnosis" value={form.diagnosis} onChange={handleChange} placeholder="Your assessment of the situation based on the provided information…" />
            <TextArea label="Expert Advice" name="advice" value={form.advice} onChange={handleChange} placeholder="Your detailed advice for the farmer…" required />
            <TextArea label="Recommended Actions" name="recommendedActions" value={form.recommendedActions} onChange={handleChange} placeholder="Specific steps the farmer should take…" />
            <TextArea label="Precautions" name="precautions" value={form.precautions} onChange={handleChange} placeholder="Things to avoid or be careful about…" rows={3} />
            <TextArea label="Follow-up Instructions" name="followUp" value={form.followUp} onChange={handleChange} placeholder="When to check back, signs of improvement, etc." rows={3} />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" disabled={submitting} className="btn btn-primary" style={{ minWidth: 180, background: '#1565c0', borderColor: '#1565c0' }}>
                {submitting ? 'Submitting…' : '✅ Complete Consultation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Completed response view */}
      {isCompleted && consultation.expertResponse?.advice && (
        <div style={{ background: '#edf7ed', border: '1px solid #b2dfb2', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1a7a1a', marginBottom: '1rem' }}>✅ Your Response (Submitted)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {consultation.expertResponse.diagnosis && <Field label="Diagnosis" value={consultation.expertResponse.diagnosis} />}
            <Field label="Advice" value={consultation.expertResponse.advice} />
            {consultation.expertResponse.recommendedActions && <Field label="Recommended Actions" value={consultation.expertResponse.recommendedActions} />}
            {consultation.expertResponse.precautions && <Field label="Precautions" value={consultation.expertResponse.precautions} />}
            {consultation.expertResponse.followUp && <Field label="Follow-up" value={consultation.expertResponse.followUp} />}
            <p style={{ fontSize: '0.75rem', color: '#1a7a1a', margin: 0 }}>
              Responded on {fmtDate(consultation.expertResponse.respondedAt)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationDetail;
