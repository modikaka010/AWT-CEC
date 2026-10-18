import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReports } from '../../../services/adminService';
import AdminTable from '../../../components/admin/AdminTable';
import StatusBadge from '../../../components/admin/StatusBadge';
import Pagination from '../../../components/admin/Pagination';

const STATUS_TABS = [
  { value: 'pending',      label: 'Pending',      color: '#d4850a' },
  { value: 'under_review', label: 'Under Review',  color: '#1565c0' },
  { value: 'resolved',     label: 'Resolved',     color: '#1a7a1a' },
  { value: 'rejected',     label: 'Rejected',     color: '#c0392b' },
  { value: '',             label: 'All',           color: '#6b7280' },
];

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError('');
    try {
      const res = await getReports({ status: statusFilter || undefined, page, limit: 15 });
      setReports(res.data.data.reports);
      setPagination(res.data.data.pagination);
    } catch { setError('Failed to load reports.'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(1); }, [load]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const columns = [
    {
      key: '_id', label: 'ID',
      render: (v) => <code style={{ fontSize: '0.7rem', background: 'var(--color-off-white)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>#{String(v).slice(-6).toUpperCase()}</code>,
    },
    {
      key: 'reportedBy', label: 'Reported By',
      render: (v) => (
        <div>
          <p style={{ fontWeight: 600, fontSize: '0.8rem', margin: 0 }}>{v?.name || '—'}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>{v?.role || ''}</p>
        </div>
      ),
    },
    { key: 'targetType', label: 'Target Type', render: (v) => <span style={{ textTransform: 'capitalize', fontSize: '0.8rem', fontWeight: 500 }}>{v}</span> },
    { key: 'targetLabel', label: 'Against', render: (v) => v || '—' },
    {
      key: 'reason', label: 'Reason',
      render: (v) => <span style={{ fontSize: '0.78rem', color: 'var(--color-text)' }}>{v?.length > 60 ? v.slice(0, 60) + '…' : v}</span>,
    },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'createdAt', label: 'Date', render: (v) => fmtDate(v) },
    {
      key: '_id', label: 'Actions',
      render: (id) => (
        <button onClick={() => navigate(`/admin/reports/${id}`)} className="btn btn-secondary btn-sm">Review</button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🚩</span>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>Reports & Complaints</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>{pagination.total} total</p>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            style={{
              padding: '0.4rem 0.875rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 600,
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

      <AdminTable columns={columns} data={reports} loading={loading} emptyText="No reports found." />
      <Pagination page={pagination.page} pages={pagination.pages} onPage={load} />
    </div>
  );
};

export default Reports;
