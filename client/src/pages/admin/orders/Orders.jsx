import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders } from '../../../services/adminService';
import AdminTable from '../../../components/admin/AdminTable';
import StatusBadge from '../../../components/admin/StatusBadge';
import Pagination from '../../../components/admin/Pagination';

const ORDER_STATUSES = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError('');
    try {
      const res = await getOrders({ status: statusFilter || undefined, page, limit: 15 });
      setOrders(res.data.data.orders);
      setPagination(res.data.data.pagination);
    } catch { setError('Failed to load orders.'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(1); }, [load]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const fmtCurrency = (n) => n !== undefined ? `₹${n.toLocaleString('en-IN')}` : '—';

  const columns = [
    {
      key: '_id', label: 'Order ID',
      render: (v) => <code style={{ fontSize: '0.7rem', background: 'var(--color-off-white)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>{String(v).slice(-8).toUpperCase()}</code>,
    },
    {
      key: 'buyer', label: 'Buyer',
      render: (v) => (
        <div>
          <p style={{ fontWeight: 600, fontSize: '0.8rem', margin: 0 }}>{v?.name || '—'}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>{v?.loginId || ''}</p>
        </div>
      ),
    },
    {
      key: 'farmer', label: 'Farmer',
      render: (v) => (
        <div>
          <p style={{ fontWeight: 600, fontSize: '0.8rem', margin: 0 }}>{v?.name || '—'}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>{v?.loginId || ''}</p>
        </div>
      ),
    },
    { key: 'totalAmount', label: 'Amount', render: (v) => <strong>{fmtCurrency(v)}</strong> },
    { key: 'paymentStatus', label: 'Payment', render: (v) => <StatusBadge status={v} size="xs" /> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'createdAt', label: 'Date', render: (v) => fmtDate(v) },
    {
      key: '_id', label: 'Actions',
      render: (id) => (
        <button onClick={() => navigate(`/admin/orders/${id}`)} className="btn btn-secondary btn-sm">View</button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>📦</span>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>Order Monitoring</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>{pagination.total} total orders</p>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '0.35rem 0.875rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 600,
              border: `2px solid ${statusFilter === s ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: statusFilter === s ? 'var(--color-primary)' : '#fff',
              color: statusFilter === s ? '#fff' : 'var(--color-text-secondary)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      <AdminTable columns={columns} data={orders} loading={loading} emptyText="No orders found." />
      <Pagination page={pagination.page} pages={pagination.pages} onPage={load} />
    </div>
  );
};

export default Orders;
