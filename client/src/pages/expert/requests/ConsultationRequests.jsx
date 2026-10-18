import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConsultationRequests } from '../../../services/expertService';
import StatusBadge from '../../../components/admin/StatusBadge';
import Pagination from '../../../components/admin/Pagination';

const PRIORITY_COLOR = {
  high:   { bg: '#fdf0ef', color: '#c0392b' },
  medium: { bg: '#fef9ec', color: '#d4850a' },
  low:    { bg: '#edf7ed', color: '#1a7a1a' },
};

const STATUS_TABS = [
  { value: 'pending',   label: 'Pending',   color: '#d4850a' },
  { value: 'accepted',  label: 'Accepted',  color: '#1565c0' },
  { value: 'completed', label: 'Completed', color: '#1a7a1a' },
  { value: 'rejected',  label: 'Rejected',  color: '#c0392b' },
  { value: 'all',       label: 'All',       color: '#6b7280' },
];

const ConsultationRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError('');
    try {
      const res = await getConsultationRequests({ status: statusFilter, page, limit: 12 });
      setRequests(res.data.data.requests);
      setPagination(res.data.data.pagination);
    } catch { setError('Failed to load consultation requests.'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(1); }, [load]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>📋</span>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>Consultation Requests</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>{pagination.total} total</p>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {STATUS_TABS.map((tab) => (
          <button key={tab.value} onClick={() => setStatusFilter(tab.value)} style={{
            padding: '0.45rem 1rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600,
            border: `2px solid ${statusFilter === tab.value ? tab.color : 'var(--color-border)'}`,
            background: statusFilter === tab.value ? tab.color : '#fff',
            color: statusFilter === tab.value ? '#fff' : 'var(--color-text-secondary)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading…</div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p>
          <p style={{ color: 'var(--color-text-muted)' }}>No {statusFilter !== 'all' ? statusFilter : ''} consultation requests.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {requests.map((req) => {
            const pc = PRIORITY_COLOR[req.priority] || PRIORITY_COLOR.medium;
            return (
              <div
                key={req._id}
                onClick={() => navigate(`/expert/requests/${req._id}`)}
                style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#e8f0fe', color: '#1565c0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                      {req.farmer?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.875rem', margin: 0 }}>{req.farmer?.name || '—'}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>{req.farmer?.loginId || ''}</p>
                    </div>
                  </div>
                  <StatusBadge status={req.status} size="xs" />
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0 0 0.875rem' }} />

                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)', margin: '0 0 0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {req.problemTitle}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: '0 0 0.875rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {req.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '9999px', background: pc.bg, color: pc.color }}>
                      🌾 {req.cropName}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '9999px', background: pc.bg, color: pc.color }}>
                      {req.priority}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{fmtDate(req.createdAt)}</span>
                </div>

                {req.status === 'pending' && (
                  <div style={{ marginTop: '0.875rem', padding: '0.5rem', background: '#1565c0', borderRadius: 'var(--radius-md)', textAlign: 'center', color: '#fff', fontSize: '0.78rem', fontWeight: 700 }}>
                    Review & Accept →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <Pagination page={pagination.page} pages={pagination.pages} onPage={load} />
    </div>
  );
};

export default ConsultationRequests;
