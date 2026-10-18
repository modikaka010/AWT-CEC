import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, hideProduct, restoreProduct } from '../../../services/adminService';
import AdminTable from '../../../components/admin/AdminTable';
import StatusBadge from '../../../components/admin/StatusBadge';
import ConfirmModal from '../../../components/admin/ConfirmModal';
import Pagination from '../../../components/admin/Pagination';

const CATEGORIES = [
  '', 'Grains & Cereals', 'Vegetables', 'Fruits', 'Pulses & Legumes',
  'Oilseeds', 'Spices & Herbs', 'Dairy & Livestock', 'Flowers', 'Other',
];

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [modal, setModal] = useState({ open: false, product: null, action: '' });
  const [hideReason, setHideReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError('');
    try {
      const res = await getProducts({ status: statusFilter || undefined, category: categoryFilter || undefined, search: search || undefined, page, limit: 15 });
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } catch { setError('Failed to load products.'); }
    finally { setLoading(false); }
  }, [statusFilter, categoryFilter, search]);

  useEffect(() => { load(1); }, [load]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput.trim()); };

  const openModal = (product, action) => { setModal({ open: true, product, action }); setHideReason(''); };
  const closeModal = () => { setModal({ open: false, product: null, action: '' }); setHideReason(''); };

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (modal.action === 'hide') await hideProduct(modal.product._id, hideReason || 'Removed by admin.');
      else await restoreProduct(modal.product._id);
      setSuccessMsg(`Product ${modal.action === 'hide' ? 'hidden' : 'restored'} successfully.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      closeModal();
      load(pagination.page);
    } catch (e) {
      setError(e.response?.data?.message || 'Action failed.');
      closeModal();
    } finally { setActionLoading(false); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const fmtPrice = (p, u) => p !== undefined ? `₹${p.toLocaleString('en-IN')} ${u || ''}` : '—';

  const columns = [
    {
      key: 'name', label: 'Product',
      render: (v, row) => (
        <div>
          <p style={{ fontWeight: 600, fontSize: '0.82rem', margin: 0, color: 'var(--color-text)' }}>{v}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>{row.category}</p>
        </div>
      ),
    },
    {
      key: 'farmer', label: 'Farmer',
      render: (v) => (
        <div>
          <p style={{ fontSize: '0.8rem', margin: 0, fontWeight: 600 }}>{v?.name || '—'}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>{v?.loginId || ''}</p>
        </div>
      ),
    },
    { key: 'price', label: 'Price', render: (v, row) => fmtPrice(v, row.priceUnit) },
    { key: 'quantity', label: 'Stock', render: (v, row) => `${v} ${row.quantityUnit || ''}` },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'createdAt', label: 'Listed', render: (v) => fmtDate(v) },
    {
      key: '_id', label: 'Actions',
      render: (id, row) => (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(`/admin/products/${id}`)} className="btn btn-secondary btn-sm">View</button>
          {row.status !== 'hidden' && (
            <button onClick={() => openModal(row, 'hide')} className="btn btn-sm" style={{ background: '#fff3e0', color: '#c0392b', border: '1px solid #ffcc80' }}>Hide</button>
          )}
          {row.status === 'hidden' && (
            <button onClick={() => openModal(row, 'restore')} className="btn btn-sm" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid #b2dfb2' }}>Restore</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🌿</span>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>Marketplace Products</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>{pagination.total} total</p>
        </div>
      </div>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: 200 }}>
          <input className="form-input" style={{ flex: 1 }} placeholder="Search products…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
          {search && <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setSearchInput(''); }}>Clear</button>}
        </form>
        <select className="form-input" style={{ width: 'auto', minWidth: 130 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {['', 'active', 'sold', 'hidden', 'draft'].map((s) => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Status'}</option>)}
        </select>
        <select className="form-input" style={{ width: 'auto', minWidth: 160 }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c || 'All Categories'}</option>)}
        </select>
      </div>

      <AdminTable columns={columns} data={products} loading={loading} emptyText="No products found." />
      <Pagination page={pagination.page} pages={pagination.pages} onPage={load} />

      <ConfirmModal
        isOpen={modal.open}
        title={modal.action === 'hide' ? 'Hide Product' : 'Restore Product'}
        message={modal.action === 'hide' ? `Hide "${modal.product?.name}"? The farmer will be notified.` : `Restore "${modal.product?.name}" to active status?`}
        confirmLabel={modal.action === 'hide' ? 'Hide' : 'Restore'}
        danger={modal.action === 'hide'}
        onConfirm={handleAction}
        onCancel={closeModal}
        loading={actionLoading}
      >
        {modal.action === 'hide' && (
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Reason (optional)</label>
            <input className="form-input" placeholder="e.g. Violates listing guidelines" value={hideReason} onChange={(e) => setHideReason(e.target.value)} />
          </div>
        )}
      </ConfirmModal>
    </div>
  );
};

export default Products;
