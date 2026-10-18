import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, updateUserStatus } from '../../../services/adminService';
import StatusBadge from '../../../components/admin/StatusBadge';
import ConfirmModal from '../../../components/admin/ConfirmModal';

const Field = ({ label, value }) => (
  <div style={{ marginBottom: '0.875rem' }}>
    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.2rem' }}>{label}</p>
    <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem', margin: 0 }}>{value || '—'}</p>
  </div>
);

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ open: false, newStatus: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getUserById(id);
      setData(res.data.data);
    } catch {
      setError('Failed to load user details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const confirmStatus = async () => {
    setActionLoading(true);
    try {
      await updateUserStatus(id, modal.newStatus);
      setSuccessMsg(`User ${modal.newStatus === 'active' ? 'activated' : 'suspended'} successfully.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setModal({ open: false, newStatus: '' });
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update status.');
      setModal({ open: false, newStatus: '' });
    } finally {
      setActionLoading(false);
    }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  const backUrl = () => {
    if (!data) return '/admin/users/farmers';
    const role = data.user?.role;
    return `/admin/users/${role === 'farmer' ? 'farmers' : role === 'buyer' ? 'buyers' : 'experts'}`;
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data?.user) return <div className="alert alert-error">User not found.</div>;

  const { user, productCount, orderCount, expertRequest } = data;

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Back */}
      <button onClick={() => navigate(backUrl())} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.25rem' }}>
        ← Back
      </button>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Header card */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.375rem' }}>
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0, color: 'var(--color-text)' }}>{user.name}</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>{user.email}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <StatusBadge status={user.role} />
            <StatusBadge status={user.status} />
          </div>
        </div>

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem', padding: '1rem', background: 'var(--color-off-white)', borderRadius: 'var(--radius-md)' }}>
          <Field label="Login ID" value={user.loginId} />
          <Field label="Mobile" value={user.mobile} />
          <Field label="Email Verified" value={user.emailVerified ? 'Yes' : 'No'} />
          <Field label="Joined" value={fmtDate(user.createdAt)} />
          {user.role === 'farmer' && <Field label="Products" value={productCount ?? '0'} />}
          {(user.role === 'farmer' || user.role === 'buyer') && <Field label="Orders" value={orderCount ?? '0'} />}
        </div>
      </div>

      {/* Expert info */}
      {user.role === 'expert' && user.expertInfo && (
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1rem' }}>Professional Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
            <Field label="Specialization" value={user.expertInfo.specialization} />
            <Field label="Qualifications" value={user.expertInfo.qualifications} />
            <Field label="Experience" value={user.expertInfo.experience} />
            <Field label="Organization" value={user.expertInfo.organization} />
          </div>
          {user.expertInfo.documentUrls?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Documents</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {user.expertInfo.documentUrls.map((url, i) => (
                  <a key={i} href={`http://localhost:5000${url}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                    📄 Document {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
          {expertRequest && (
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Verification status:</p>
              <StatusBadge status={expertRequest.status} />
              <button onClick={() => navigate(`/admin/verification/requests/${expertRequest._id}`)} className="btn btn-secondary btn-sm">
                View Request
              </button>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {user.role !== 'admin' && (
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: '0.875rem' }}>Account Actions</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {user.status === 'active' && (
              <button onClick={() => setModal({ open: true, newStatus: 'suspended' })} className="btn btn-sm" style={{ background: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80' }}>
                🚫 Suspend Account
              </button>
            )}
            {user.status === 'suspended' && (
              <button onClick={() => setModal({ open: true, newStatus: 'active' })} className="btn btn-sm" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid #b2dfb2' }}>
                ✅ Activate Account
              </button>
            )}
          </div>
          {user.status === 'pending' && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: '0.5rem 0 0' }}>
              This expert is pending verification. Use the Expert Requests page to approve or reject.
            </p>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={modal.open}
        title={modal.newStatus === 'active' ? 'Activate Account' : 'Suspend Account'}
        message={modal.newStatus === 'active' ? `Activate ${user.name}?` : `Suspend ${user.name}? They will be locked out immediately.`}
        confirmLabel={modal.newStatus === 'active' ? 'Activate' : 'Suspend'}
        danger={modal.newStatus === 'suspended'}
        onConfirm={confirmStatus}
        onCancel={() => setModal({ open: false, newStatus: '' })}
        loading={actionLoading}
      />
    </div>
  );
};

export default UserDetails;
