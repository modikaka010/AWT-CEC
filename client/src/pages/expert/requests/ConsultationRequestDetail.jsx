import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getConsultationRequestById,
  acceptConsultation,
  rejectConsultation,
} from '../../../services/expertService';
import StatusBadge from '../../../components/admin/StatusBadge';
import ConfirmModal from '../../../components/admin/ConfirmModal';

const Field = ({ label, value }) => (
  <div>
    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.2rem' }}>{label}</p>
    <p style={{ fontWeight: 500, color: 'var(--color-text)', fontSize: '0.875rem', margin: 0 }}>{value || '—'}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1rem' }}>{title}</h3>
    {children}
  </div>
);

const ConsultationRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [acceptModal, setAcceptModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectErr, setRejectErr] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await getConsultationRequestById(id);
      setConsultation(res.data.data.consultation);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load consultation.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await acceptConsultation(id);
      setSuccessMsg('Consultation accepted! The farmer will be notified.');
      setAcceptModal(false);
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to accept.');
      setAcceptModal(false);
    } finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    setRejectErr('');
    if (!rejectReason.trim() || rejectReason.trim().length < 5) {
      setRejectErr('Please provide a reason of at least 5 characters.');
      return;
    }
    setActionLoading(true);
    try {
      await rejectConsultation(id, rejectReason.trim());
      setSuccessMsg('Consultation request rejected.');
      setRejectModal(false);
      setRejectReason('');
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to reject.');
      setRejectModal(false);
    } finally { setActionLoading(false); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</div>;
  if (!consultation) return <div className="alert alert-error">{error || 'Consultation not found.'}</div>;

  const isPending = consultation.status === 'pending';
  const PRIORITY_COLOR = { high: '#c0392b', medium: '#d4850a', low: '#1a7a1a' };

  return (
    <div style={{ maxWidth: 760 }}>
      <button onClick={() => navigate('/expert/requests')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1565c0', fontWeight: 600, fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.25rem' }}>
        ← Back to Requests
      </button>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Header */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.2rem', margin: 0, color: 'var(--color-text)' }}>{consultation.problemTitle}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <StatusBadge status={consultation.status} size="md" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: '#e8f0fe', color: '#1565c0' }}>
                🌾 {consultation.cropName}
              </span>
              {consultation.priority && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: '#fef9ec', color: PRIORITY_COLOR[consultation.priority] || '#d4850a' }}>
                  Priority: {consultation.priority}
                </span>
              )}
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>Submitted {fmtDate(consultation.createdAt)}</p>
        </div>
      </div>

      {/* Farmer info */}
      <Section title="👨‍🌾 Farmer Information">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          <Field label="Name"     value={consultation.farmer?.name} />
          <Field label="Email"    value={consultation.farmer?.email} />
          <Field label="Mobile"   value={consultation.farmer?.mobile} />
          <Field label="Login ID" value={consultation.farmer?.loginId} />
          {consultation.farmLocation && <Field label="Farm Location" value={consultation.farmLocation} />}
        </div>
      </Section>

      {/* Problem details */}
      <Section title="🌿 Problem Details">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Problem Title" value={consultation.problemTitle} />
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.4rem' }}>Description</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.7, background: 'var(--color-off-white)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', margin: 0 }}>
              {consultation.description}
            </p>
          </div>
          {consultation.symptoms && (
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.4rem' }}>Symptoms</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.7, background: 'var(--color-off-white)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', margin: 0 }}>
                {consultation.symptoms}
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* Images */}
      {consultation.images?.length > 0 && (
        <Section title="📷 Uploaded Images">
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {consultation.images.map((img, i) => (
              <a key={i} href={`http://localhost:5000${img}`} target="_blank" rel="noopener noreferrer">
                <img src={`http://localhost:5000${img}`} alt={`Image ${i + 1}`} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  onError={(e) => { e.target.style.display = 'none'; }} />
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* Expert response (if completed) */}
      {consultation.expertResponse?.advice && (
        <Section title="✅ Your Response">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {consultation.expertResponse.diagnosis && <Field label="Diagnosis / Observation" value={consultation.expertResponse.diagnosis} />}
            <Field label="Advice" value={consultation.expertResponse.advice} />
            {consultation.expertResponse.recommendedActions && <Field label="Recommended Actions" value={consultation.expertResponse.recommendedActions} />}
            {consultation.expertResponse.precautions && <Field label="Precautions" value={consultation.expertResponse.precautions} />}
            {consultation.expertResponse.followUp && <Field label="Follow-up" value={consultation.expertResponse.followUp} />}
          </div>
        </Section>
      )}

      {/* Rejection reason */}
      {consultation.rejectionReason && (
        <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
          <strong>Rejection Reason:</strong> {consultation.rejectionReason}
        </div>
      )}

      {/* Actions — only for pending */}
      {isPending && (
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => setAcceptModal(true)} className="btn btn-primary" style={{ flex: 1, minWidth: 140 }}>
            ✅ Accept Consultation
          </button>
          <button onClick={() => { setRejectModal(true); setRejectReason(''); setRejectErr(''); }} className="btn" style={{ flex: 1, minWidth: 140, background: 'var(--color-error)', color: '#fff', border: '2px solid var(--color-error)' }}>
            ❌ Reject Request
          </button>
        </div>
      )}

      {/* Navigate to full consultation view if accepted */}
      {consultation.status === 'accepted' && (
        <div style={{ background: '#e8f0fe', border: '1px solid #bbdefb', borderRadius: 'var(--radius-xl)', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#1565c0', fontWeight: 600 }}>This consultation is active. Provide your advice to complete it.</p>
          <button onClick={() => navigate(`/expert/consultations/${id}`)} className="btn btn-primary btn-sm">
            Go to Consultation →
          </button>
        </div>
      )}

      {/* Accept Modal */}
      <ConfirmModal
        isOpen={acceptModal}
        title="Accept Consultation"
        message={`Accept "${consultation.problemTitle}" from ${consultation.farmer?.name}? They will be notified immediately.`}
        confirmLabel="Accept"
        onConfirm={handleAccept}
        onCancel={() => setAcceptModal(false)}
        loading={actionLoading}
      />

      {/* Reject Modal */}
      <ConfirmModal
        isOpen={rejectModal}
        title="Reject Consultation Request"
        message={`Reject "${consultation.problemTitle}"? Please provide a reason.`}
        confirmLabel="Confirm Rejection"
        danger
        onConfirm={handleReject}
        onCancel={() => { setRejectModal(false); setRejectReason(''); }}
        loading={actionLoading}
      >
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
            Reason <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <textarea className="form-input" rows={3} placeholder="e.g. Outside my area of specialization…" value={rejectReason} onChange={(e) => { setRejectReason(e.target.value); setRejectErr(''); }} style={{ resize: 'vertical' }} />
          {rejectErr && <p className="form-error">{rejectErr}</p>}
        </div>
      </ConfirmModal>
    </div>
  );
};

export default ConsultationRequestDetail;
