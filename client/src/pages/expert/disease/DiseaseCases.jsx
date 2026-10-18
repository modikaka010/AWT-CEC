import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDiseaseCases } from '../../../services/expertService';
import StatusBadge from '../../../components/admin/StatusBadge';
import Pagination from '../../../components/admin/Pagination';

const STATUS_TABS = [
  { value: 'pending',      label: 'Pending',      color: '#d4850a' },
  { value: 'under_review', label: 'Under Review',  color: '#1565c0' },
  { value: 'diagnosed',    label: 'Diagnosed',    color: '#1a7a1a' },
  { value: 'closed',       label: 'Closed',       color: '#6b7280' },
];

const DiseaseCases = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError('');
    try {
      const res = await getDiseaseCases({ status: statusFilter, page, limit: 12 });
      setCases(res.data.data.cases);
      setPagination(res.data.data.pagination);
    } catch { setError('Failed to load disease cases.'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(1); }, [load]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🦠</span>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>Disease Cases</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>{pagination.total} total</p>
        </div>
      </div>

      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#92400e' }}>
        ℹ️ Advice provided is agricultural guidance only and is not a guaranteed scientific diagnosis. Results may vary.
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {STATUS_TABS.map((tab) => (
          <button key={tab.value} onClick={() => setStatusFilter(tab.value)} style={{
            padding: '0.4rem 0.875rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 600,
            border: `2px solid ${statusFilter === tab.value ? tab.color : 'var(--color-border)'}`,
            background: statusFilter === tab.value ? tab.color : '#fff',
            color: statusFilter === tab.value ? '#fff' : 'var(--color-text-secondary)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>{tab.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading…</div>
      ) : cases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌿</p>
          <p style={{ color: 'var(--color-text-muted)' }}>No {statusFilter} disease cases.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {cases.map((c) => (
            <div key={c._id} onClick={() => navigate(`/expert/disease/${c._id}`)} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>🌾 {c.cropName}</p>
                  {c.plantPart && <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: '0.1rem 0 0' }}>Plant part: {c.plantPart}</p>}
                </div>
                <StatusBadge status={c.status} size="xs" />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '0 0 0.875rem', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {c.symptoms}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e8f5e9', color: '#1a6b1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.7rem', flexShrink: 0 }}>
                    {c.farmer?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{c.farmer?.name || '—'}</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{fmtDate(c.createdAt)}</span>
              </div>
              {(c.status === 'pending' || c.status === 'under_review') && (
                <div style={{ marginTop: '0.875rem', padding: '0.4rem', background: '#1565c0', borderRadius: 'var(--radius-md)', textAlign: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                  Review & Advise →
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

export default DiseaseCases;
