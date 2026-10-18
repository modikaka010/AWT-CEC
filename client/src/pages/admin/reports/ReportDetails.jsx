import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReportById, updateReportStatus } from '../../../services/adminService';
import StatusBadge from '../../../components/admin/StatusBadge';
import ConfirmModal from '../../../components/admin/ConfirmModal';

const Field = ({ label, value }) => (
  <div>
    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.2rem' }}>{label}</p>
    <p style={{ fontWeight: 500, color: 'var(--color-text)', fontSize: '0.875rem', margin: 0 }}>{value || '—'}</p>
  </div>
);

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [modal, setModal] = useState({ open: false, newStatus: '' });
  const [resolutionNote, setResolutionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await getReportById(id);
      setReport(res.data.data.report);
    } catch { setError('Failed to load report.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusUpdate = async () => {
    setActionLoading(true);
    try {
      await updateReportStatus(id, modal.newStatus, resolutionNote);
      setSuccessMsg(`Report marked as ${modal.newStatus.replace('_', ' ')}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setModal({ open: false, newStatus: '' });
      setResolutionNote('');
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update report.');
      setModal({ open: false, newStatus: '' });
    } finally { setActionLoading(false); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  const ACTION_BUTTONS = [
    { status: 'under_review', label: '🔍 Mark Under Review', bg: '#e8f0fe', color: '#1565c0', border: '#bbdefb' },
    { status: 'resolved',     label: '✅ Mark Resolved',     bg: 'var(--color-success-bg)', color: 'var(--color-success)', border: '#b2dfb2' },
    { status: 'rejected',     label: '❌ Reject Report',      bg: 'var(--color-error-bg)', color: 'var(--color-error)', border: '#f5c6c3' },
  ];

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</div>;
  if (!report) return <div className="alert alert-error">{error || 'Report not found.'}</div>;

  return (
    <div style={{ maxWidth: 760 }}>
      <button onClick={() => navigate('/admin/reports')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.25rem' }}>
        ← Back to Reports
      </button>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Header */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <code style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Report #{String(report._id).slice(-8).toUpperCase()}</code>
            <h2 style={{ fontWeight: 800, fontSize: '1.15rem', margin: '0.25rem 0 0', color: 'var(--color-text)' }}>{report.reason}</h2>
          </div>
          <StatusBadge status={report.status} size="md" />
        </div>
        {report.description && (
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.875rem', lineHeight: 1.6 }}>{report.description}</p>
        )}
      </div>

      {/* Reporter */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>👤 Reported By</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem' }}>
          <Field label="Name" value={report.reportedBy?.name} />
          <Field label="Email" value={report.reportedBy?.email} />
          <Field label="Role" value={report.reportedBy?.role} />
          <Field label="Login ID" value={report.reportedBy?.loginId} />
          <Field label="Mobile" value={report.reportedBy?.mobile} />
          <Field label="Submitted" value={fmtDate(report.createdAt)} />
        </div>
        <button onClick={() => navigate(`/admin/users/${report.reportedBy?._id}`)} className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>View Profile →</button>
      </div>

      {/* Target */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>🎯 Report Target</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem' }}>
          <Field label="Target Type" value={<span style={{ textTransform: 'capitalize' }}>{report.targetType}</span>} />
          <Field label="Target" value={report.targetLabel} />
        </div>
      </div>

      {/* Review info */}
      {report.reviewedBy && (
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>📋 Review Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem' }}>
            <Field label="Reviewed By" value={report.reviewedBy?.name} />
            <Field label="Reviewed On" value={fmtDate(report.reviewedAt)} />
          </div>
          {report.resolutionNote && (
            <div style={{ marginTop: '0.875rem' }}>
              <Field label="Resolution Note" value={report.resolutionNote} />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {report.status !== 'resolved' && report.status !== 'rejected' && (
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {ACTION_BUTTONS.filter(b => b.status !== report.status).map((btn) => (
            <button
              key={btn.status}
              onClick={() => { setModal({ open: true, newStatus: btn.status }); setResolutionNote(''); }}
              className="btn btn-sm"
              style={{ background: btn.bg, color: btn.color, border: `1px solid ${btn.border}` }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={modal.open}
        title={`Update Report Status`}
        message={`Mark this report as "${modal.newStatus?.replace('_', ' ')}"?`}
        confirmLabel="Update"
        onConfirm={handleStatusUpdate}
        onCancel={() => { setModal({ open: false, newStatus: '' }); setResolutionNote(''); }}
        loading={actionLoading}
      >
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
            Resolution Note <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea className="form-input" rows={3} placeholder="Add a note about your decision…" value={resolutionNote} onChange={(e) => setResolutionNote(e.target.value)} style={{ resize: 'vertical' }} />
        </div>
      </ConfirmModal>
    </div>
  );
};

export default ReportDetails;
