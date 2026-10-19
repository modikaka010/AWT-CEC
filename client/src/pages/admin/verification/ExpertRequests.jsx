import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExpertRequests } from '../../../services/adminService';
import StatusBadge from '../../../components/admin/StatusBadge';
import Pagination from '../../../components/admin/Pagination';

const ExpertRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await getExpertRequests({ status: statusFilter || 'all', page, limit: 15 });
      setRequests(res.data.data.requests);
      setPagination(res.data.data.pagination);
    } catch {
      setError('Failed to load expert requests.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(1); }, [load]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const STATUS_TABS = [
    { value: 'pending',  label: 'Pending',  color: '#d4850a' },
    { value: 'approved', label: 'Approved', color: '#1a7a1a' },
    { value: 'rejected', label: 'Rejected', color: '#c0392b' },
    { value: 'all',      label: 'All',      color: '#6b7280' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>✅</span>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0, color: 'var(--color-text)' }}>Expert Verification Requests</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>{pagination.total} requests</p>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            style={{
              padding: '0.45rem 1rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600,
              border: `2px solid ${statusFilter === tab.value ? tab.color : 'var(--color-border)'}`,
              background: statusFilter === tab.value ? tab.color : '#fff',
              color: statusFilter === tab.value ? '#fff' : 'var(--color-text-secondary)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading…</div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p>
          <p style={{ color: 'var(--color-text-muted)' }}>No {statusFilter !== 'all' ? statusFilter : ''} expert requests.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {requests.map((req) => (
            <div
              key={req._id}
              onClick={() => navigate(`/admin/verification/requests/${req._id}`)}
              style={{
                background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)',
                padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' }}>
                    {req.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0, color: 'var(--color-text)' }}>{req.name}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>{req.email}</p>
                  </div>
                </div>
                <StatusBadge status={req.status} />
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0 0 0.875rem' }} />

              {/* Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.875rem' }}>
                {[
                  { label: 'Specialization', value: req.specialization },
                  { label: 'Qualification', value: req.qualifications },
                  { label: 'Experience', value: req.experience },
                  { label: 'Organization', value: req.organization },
                ].map(({ label, value }) => value && (
                  <div key={label}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', margin: '0 0 0.1rem' }}>{label}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text)', margin: 0, fontWeight: 500 }}>{value}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Submitted {fmtDate(req.createdAt)}</span>
                {req.documentUrls?.length > 0 && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600 }}>📄 {req.documentUrls.length} doc{req.documentUrls.length !== 1 ? 's' : ''}</span>
                )}
              </div>

              {req.status === 'pending' && (
                <div style={{ marginTop: '0.875rem', padding: '0.5rem 0.875rem', background: 'var(--color-primary)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: '#fff', fontSize: '0.78rem', fontWeight: 700 }}>
                  Review Request →
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onPage={load} />
    </div>
  );
};

export default ExpertRequests;
