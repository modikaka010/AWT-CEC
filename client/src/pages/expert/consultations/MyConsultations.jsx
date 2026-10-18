import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyConsultations } from '../../../services/expertService';
import StatusBadge from '../../../components/admin/StatusBadge';
import Pagination from '../../../components/admin/Pagination';


const STATUS_TABS = [
  { value: '',          label: 'All',       color: '#6b7280' },
  { value: 'accepted',  label: 'Active',    color: '#1565c0' },
  { value: 'completed', label: 'Completed', color: '#1a7a1a' },
  { value: 'rejected',  label: 'Rejected',  color: '#c0392b' },
  { value: 'cancelled', label: 'Cancelled', color: '#6d28d9' },
];

const MyConsultations = () => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError('');
    try {
      const res = await getMyConsultations({ status: statusFilter || 'all', page, limit: 15 });
      setConsultations(res.data.data.consultations);
      setPagination(res.data.data.pagination);
    } catch { setError('Failed to load consultations.'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(1); }, [load]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🗓️</span>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>My Consultations</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>{pagination.total} total</p>
        </div>
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

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading…</div>
      ) : consultations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p>
          <p style={{ color: 'var(--color-text-muted)' }}>No consultations found.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-off-white)', borderBottom: '2px solid var(--color-border)' }}>
                {['Farmer', 'Crop', 'Problem', 'Priority', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {consultations.map((c, idx) => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--color-border)', background: idx % 2 === 0 ? '#fff' : 'var(--color-off-white)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f7ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : 'var(--color-off-white)')}
                >
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.82rem', margin: 0 }}>{c.farmer?.name || '—'}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>{c.farmer?.loginId || ''}</p>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem' }}>{c.cropName}</td>
                  <td style={{ padding: '0.75rem 1rem', maxWidth: 200 }}>
                    <p style={{ fontSize: '0.82rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.problemTitle}</p>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize', color: c.priority === 'high' ? '#c0392b' : c.priority === 'low' ? '#1a7a1a' : '#d4850a' }}>
                      {c.priority}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}><StatusBadge status={c.status} /></td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(c.createdAt)}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <button onClick={() => navigate(`/expert/consultations/${c._id}`)} className="btn btn-secondary btn-sm">
                      {c.status === 'accepted' ? 'Respond' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={pagination.page} pages={pagination.pages} onPage={load} />
    </div>
  );
};

export default MyConsultations;
