import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExpertRequestById, approveExpert, rejectExpert } from '../../../services/adminService';
import StatusBadge from '../../../components/admin/StatusBadge';
import ConfirmModal from '../../../components/admin/ConfirmModal';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const Field = ({ label, value }) => (
  <div>
    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.2rem' }}>{label}</p>
    <p style={{ fontWeight: 500, color: 'var(--color-text)', fontSize: '0.875rem', margin: 0 }}>{value || '—'}</p>
  </div>
);

/**
 * Builds the correct document URL.
 * - In development: Vite proxies /uploads → http://localhost:5000/uploads
 *   so we use a relative URL starting with /uploads/...
 * - The stored value in MongoDB is already "/uploads/expert-docs/filename.pdf"
 * - We just make sure it starts with / (relative to the Vite dev server)
 */
const buildDocUrl = (url) => {
  if (!url) return '';
  // Already a relative path starting with /uploads
  if (url.startsWith('/uploads')) return url;
  // Strip any accidental absolute prefix and return relative
  return url.replace(/^https?:\/\/[^/]+/, '');
};

const isPdf   = (url) => /\.pdf$/i.test(url);
const isImage = (url) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

// ─────────────────────────────────────────────────────────────────────────────
// Image with error fallback
// ─────────────────────────────────────────────────────────────────────────────
const DocImage = ({ src, alt }) => {
  const [status, setStatus] = useState('loading'); // loading | loaded | error

  return (
    <div style={{ width: '100%', minHeight: 220, background: '#f5f5f5', position: 'relative' }}>
      {status !== 'loaded' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          {status === 'loading' ? (
            <>
              <span style={{ fontSize: '1.5rem' }}>⏳</span>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>Loading image…</p>
            </>
          ) : (
            <>
              <span style={{ fontSize: '1.5rem' }}>🖼️</span>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>Image could not be displayed.</p>
              <a href={src} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ marginTop: '0.25rem', textDecoration: 'none' }}>
                Open in new tab
              </a>
            </>
          )}
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        style={{
          width: '100%',
          maxHeight: 400,
          objectFit: 'contain',
          display: status === 'loaded' ? 'block' : 'none',
          background: '#fff',
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PDF viewer using <iframe>
// ─────────────────────────────────────────────────────────────────────────────
const DocPdf = ({ src, title }) => {
  const [show, setShow] = useState(false);

  return (
    <div>
      {/* Always show a reliable open-in-tab option first */}
      {!show && (
        <div style={{ padding: '1.5rem', background: '#f8f9fa', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '2.5rem' }}>📋</span>
          <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)', margin: 0 }}>PDF Document</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0, textAlign: 'center' }}>
            Click below to preview inline or open in a new tab
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => setShow(true)} className="btn btn-primary btn-sm">
              👁️ Preview Inline
            </button>
            <a href={src} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
              📋 Open in New Tab
            </a>
            <a href={src} download className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
              ⬇️ Download
            </a>
          </div>
        </div>
      )}

      {show && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '0.5rem 0.75rem', background: '#f0f0f0', borderBottom: '1px solid var(--color-border)' }}>
            <a href={src} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
              Open in New Tab ↗
            </a>
            <a href={src} download className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
              ⬇️ Download
            </a>
            <button onClick={() => setShow(false)} className="btn btn-secondary btn-sm">
              ✕ Close Preview
            </button>
          </div>
          <iframe
            src={src}
            title={title}
            style={{ width: '100%', height: 600, border: 'none', display: 'block', background: '#525659' }}
          />
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
const ExpertRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getExpertRequestById(id);
      setRequest(res.data.data.request);
    } catch {
      setError('Failed to load expert request.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approveExpert(id);
      setSuccessMsg('Expert approved successfully! They can now log in.');
      setApproveModal(false);
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to approve expert.');
      setApproveModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setRejectError('');
    if (!rejectReason.trim() || rejectReason.trim().length < 10) {
      setRejectError('Please provide a reason of at least 10 characters.');
      return;
    }
    setActionLoading(true);
    try {
      await rejectExpert(id, rejectReason.trim());
      setSuccessMsg('Expert application rejected.');
      setRejectModal(false);
      setRejectReason('');
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to reject expert.');
      setRejectModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</div>;
  if (error && !request) return <div className="alert alert-error">{error}</div>;
  if (!request) return <div className="alert alert-error">Request not found.</div>;

  const { user } = request;
  const isPending = request.status === 'pending';

  return (
    <div style={{ maxWidth: 780 }}>
      {/* Back */}
      <button
        onClick={() => navigate('/admin/verification/requests')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.25rem' }}
      >
        ← Back to Requests
      </button>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Header */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.375rem' }}>
            {request.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0, color: 'var(--color-text)' }}>{request.name}</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>{request.email}</p>
          </div>
          <StatusBadge status={request.status} size="md" />
        </div>
      </div>

      {/* Personal Information */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          👤 Personal Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          <Field label="Full Name"      value={request.name} />
          <Field label="Email"          value={request.email} />
          <Field label="Mobile"         value={user?.mobile} />
          <Field label="Login ID"       value={user?.loginId} />
          <Field label="Submitted"      value={fmtDate(request.createdAt)} />
          <Field label="Account Status" value={<StatusBadge status={user?.status} />} />
        </div>
      </div>

      {/* Professional Information */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🎓 Professional Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          <Field label="Specialization" value={request.specialization} />
          <Field label="Qualifications" value={request.qualifications} />
          <Field label="Experience"     value={request.experience} />
          <Field label="Organization"   value={request.organization} />
        </div>
      </div>

      {/* ── Documents ── */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📄 Uploaded Documents
            {request.documentUrls?.length > 0 && (
              <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--color-primary-muted)', color: 'var(--color-primary)', borderRadius: '9999px', padding: '0.15rem 0.5rem' }}>
                {request.documentUrls.length} file{request.documentUrls.length !== 1 ? 's' : ''}
              </span>
            )}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Use "Preview Inline" for PDFs or "Open in New Tab" for best viewing
          </p>
        </div>

        {!request.documentUrls?.length ? (
          <div style={{ padding: '2rem', background: 'var(--color-off-white)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <p style={{ fontSize: '1.75rem', marginBottom: '0.375rem' }}>📭</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>
              This expert did not upload any documents.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {request.documentUrls.map((url, i) => {
              const docUrl = buildDocUrl(url);
              const fileName = url.split('/').pop();
              const docIsPdf   = isPdf(url);
              const docIsImage = isImage(url);

              return (
                <div
                  key={i}
                  style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
                >
                  {/* ── Document header bar ── */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem', background: 'var(--color-off-white)',
                    borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '0.5rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{docIsPdf ? '📋' : '🖼️'}</span>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-text)', margin: 0 }}>
                          Document {i + 1} — {docIsPdf ? 'PDF' : docIsImage ? 'Image' : 'File'}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0, wordBreak: 'break-all' }}>
                          {fileName}
                        </p>
                      </div>
                    </div>
                    {/* Always-available action buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm"
                        style={{ textDecoration: 'none' }}
                      >
                        ↗ Open in New Tab
                      </a>
                      <a
                        href={docUrl}
                        download={fileName}
                        className="btn btn-secondary btn-sm"
                        style={{ textDecoration: 'none' }}
                      >
                        ⬇️ Download
                      </a>
                    </div>
                  </div>

                  {/* ── Document preview body ── */}
                  {docIsPdf && <DocPdf src={docUrl} title={`Document ${i + 1} — ${fileName}`} />}
                  {docIsImage && <DocImage src={docUrl} alt={`Document ${i + 1}`} />}
                  {!docIsPdf && !docIsImage && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', background: '#f9f9f9' }}>
                      <p style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>📁</p>
                      <p style={{ fontSize: '0.85rem', margin: 0 }}>
                        Preview not available for this file type. Use the buttons above to open or download.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review info (if already reviewed) */}
      {!isPending && request.reviewedBy && (
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1rem' }}>Review Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            <Field label="Reviewed By"      value={request.reviewedBy?.name} />
            <Field label="Reviewed On"      value={fmtDate(request.reviewedAt)} />
            {request.rejectionReason && (
              <Field label="Rejection Reason" value={request.rejectionReason} />
            )}
          </div>
        </div>
      )}

      {/* Actions — only for pending */}
      {isPending && (
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setApproveModal(true)}
            className="btn btn-primary"
            style={{ flex: 1, minWidth: 140 }}
          >
            ✅ Approve Expert
          </button>
          <button
            onClick={() => { setRejectModal(true); setRejectReason(''); setRejectError(''); }}
            className="btn"
            style={{ flex: 1, minWidth: 140, background: 'var(--color-error)', color: '#fff', border: '2px solid var(--color-error)' }}
          >
            ❌ Reject Expert
          </button>
        </div>
      )}

      {/* Approve Modal */}
      <ConfirmModal
        isOpen={approveModal}
        title="Approve Expert Application"
        message={`Approve ${request.name} as an Agricultural Expert? They will be notified by email and can log in immediately.`}
        confirmLabel="Approve"
        onConfirm={handleApprove}
        onCancel={() => setApproveModal(false)}
        loading={actionLoading}
      />

      {/* Reject Modal */}
      <ConfirmModal
        isOpen={rejectModal}
        title="Reject Expert Application"
        message={`Reject ${request.name}'s application? Please provide a reason below.`}
        confirmLabel="Confirm Rejection"
        danger
        onConfirm={handleReject}
        onCancel={() => { setRejectModal(false); setRejectReason(''); setRejectError(''); }}
        loading={actionLoading}
      >
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '0.4rem' }}>
            Rejection Reason <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <textarea
            className="form-input"
            rows={3}
            placeholder="e.g. Documents are unclear or do not match the stated qualifications…"
            value={rejectReason}
            onChange={(e) => { setRejectReason(e.target.value); setRejectError(''); }}
            style={{ resize: 'vertical' }}
          />
          {rejectError && <p className="form-error">{rejectError}</p>}
        </div>
      </ConfirmModal>
    </div>
  );
};

export default ExpertRequestDetail;
