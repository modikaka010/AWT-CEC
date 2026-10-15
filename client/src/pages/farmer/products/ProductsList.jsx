/**
 * ProductsList.jsx  –  Farmer: My Products management page
 *
 * Drop-in replacement for the original file.
 * All API calls, service imports, and routing are preserved exactly.
 * Only the UI layer is changed.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../../services/farmerService';
import StatusBadge from '../../../components/admin/StatusBadge';
import Pagination from '../../../components/admin/Pagination';
import ConfirmModal from '../../../components/admin/ConfirmModal';

/* ── Constants ─────────────────────────────────────────────────────────── */
const ACCENT = '#1a6b1a'; // farmer green

const CATEGORIES = [
  'Grains & Cereals','Vegetables','Fruits','Pulses & Legumes',
  'Oilseeds','Spices & Herbs','Dairy & Livestock','Flowers','Other',
];

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'sold', label: 'Sold out' },
  { value: 'hidden', label: 'Hidden' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'qty_asc', label: 'Stock ↑' },
  { value: 'qty_desc', label: 'Stock ↓' },
];

/* ── Helper: Stock indicator ─────────────────────────────────────────── */
const StockIndicator = ({ qty, unit }) => {
  const color = qty <= 0 ? 'var(--color-error)'
    : qty <= 10 ? 'var(--color-warning)'
    : 'var(--color-success)';
  const bg = qty <= 0 ? 'var(--color-error-bg)'
    : qty <= 10 ? 'var(--color-warning-bg)'
    : 'var(--color-success-bg)';
  const label = qty <= 0 ? 'Out of stock' : qty <= 10 ? 'Low stock' : 'In stock';
  return (
    <div>
      <span style={{
        display: 'inline-block', padding: '0.1rem 0.45rem',
        borderRadius: 'var(--radius-full)', fontSize: '0.6rem', fontWeight: 700,
        background: bg, color, marginBottom: 2,
      }}>
        {label}
      </span>
      <p style={{ fontWeight: 700, fontSize: '0.85rem', color, margin: 0 }}>
        {qty} <span style={{ fontWeight: 500, color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>{unit}</span>
      </p>
    </div>
  );
};

/* ── Product Row ─────────────────────────────────────────────────────── */
const ProductRow = ({ p, onView, onEdit, onArchive, fmtDate }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: '1px solid var(--color-border-light)',
        background: hovered ? 'var(--color-primary-subtle)' : 'transparent',
        transition: 'background 0.15s ease',
      }}
    >
      {/* Product info */}
      <td style={{ padding: '0.875rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary-subtle)', overflow: 'hidden', flexShrink: 0,
            border: '1.5px solid var(--color-border)',
          }}>
            {p.images?.[0] ? (
              <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🌾</div>
            )}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.875rem', margin: 0, color: 'var(--color-text)' }}>{p.name}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: '0.1rem 0 0' }}>
              {p.category}
              {p.location?.district && ` · ${p.location.district}, ${p.location.state}`}
            </p>
          </div>
        </div>
      </td>

      {/* Price */}
      <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
        <p style={{ fontWeight: 800, fontSize: '0.9rem', color: ACCENT, margin: 0 }}>
          ₹{p.price?.toLocaleString('en-IN')}
        </p>
        <p style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', margin: 0 }}>{p.priceUnit}</p>
      </td>

      {/* Stock */}
      <td style={{ padding: '0.875rem 1rem' }}>
        <StockIndicator qty={p.quantity} unit={p.quantityUnit} />
      </td>

      {/* Status */}
      <td style={{ padding: '0.875rem 1rem' }}>
        <StatusBadge status={p.status} size="xs" />
      </td>

      {/* Date */}
      <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
        {fmtDate(p.createdAt)}
      </td>

      {/* Actions */}
      <td style={{ padding: '0.875rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            onClick={() => onView(p._id)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem' }}
          >
            View
          </button>
          <button
            onClick={() => onEdit(p._id)}
            className="btn btn-sm"
            style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem', background: ACCENT, color: '#fff', borderColor: ACCENT }}
          >
            Edit
          </button>
          <button
            onClick={() => onArchive(p._id, p.name)}
            className="btn btn-sm"
            style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem', background: 'var(--color-error-bg)', color: 'var(--color-error)', borderColor: 'var(--color-error-border)' }}
          >
            Archive
          </button>
        </div>
      </td>
    </tr>
  );
};

/* ── Empty State ─────────────────────────────────────────────────────── */
const EmptyState = ({ hasFilters, onClear, onAdd }) => (
  <div style={{
    textAlign: 'center', padding: '4rem 2rem',
    background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)',
    border: '1.5px dashed var(--color-border)',
  }}>
    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🌾</span>
    <h3 style={{ fontWeight: 700, fontSize: '1.05rem', margin: '0 0 0.4rem' }}>
      {hasFilters ? 'No products match your search' : 'You haven\'t listed any products yet'}
    </h3>
    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: '0 0 1.25rem' }}>
      {hasFilters
        ? 'Try adjusting the search, category, or status filters.'
        : 'List your first product and start selling directly to buyers.'}
    </p>
    {hasFilters ? (
      <button className="btn btn-secondary btn-sm" onClick={onClear}>Clear filters</button>
    ) : (
      <button className="btn btn-sm" style={{ background: ACCENT, color: '#fff', borderColor: ACCENT }} onClick={onAdd}>
        ➕ Add first product
      </button>
    )}
  </div>
);

/* ── Main Component ─────────────────────────────────────────────────── */
const ProductsList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');

  // Archive modal
  const [archiveModal, setArchiveModal] = useState({ open: false, id: null, name: '' });
  const [archiveLoading, setArchiveLoading] = useState(false);

  const hasFilters = !!(search || status || category);

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError('');
    try {
      const res = await getProducts({
        search: search || undefined,
        status: status || undefined,
        category: category || undefined,
        sort, page, limit: 15,
      });
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } catch {
      setError('Failed to load products. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  }, [search, status, category, sort]);

  useEffect(() => { load(1); }, [load]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput.trim()); };

  const handleArchive = async () => {
    setArchiveLoading(true);
    try {
      await deleteProduct(archiveModal.id);
      setSuccessMsg(`"${archiveModal.name}" was archived.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setArchiveModal({ open: false, id: null, name: '' });
      load(pagination.page);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to archive product.');
      setArchiveModal({ open: false, id: null, name: '' });
    } finally {
      setArchiveLoading(false);
    }
  };

  const clearFilters = () => { setSearch(''); setSearchInput(''); setStatus(''); setCategory(''); };

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.35rem', margin: 0 }}>My Products</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0.2rem 0 0' }}>
            {loading ? 'Loading…' : `${pagination.total} listing${pagination.total !== 1 ? 's' : ''} in your catalogue`}
          </p>
        </div>
        <button
          onClick={() => navigate('/farmer/products/new')}
          className="btn btn-sm"
          style={{ background: ACCENT, color: '#fff', borderColor: ACCENT }}
        >
          ➕ Add Product
        </button>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)', padding: '1.1rem 1.25rem',
      }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {/* Search */}
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Search
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', color: 'var(--color-text-muted)', pointerEvents: 'none' }}>🔍</span>
              <input
                className="form-input"
                style={{ paddingLeft: '2rem', height: 38 }}
                placeholder="Name or category…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <div style={{ flex: '0 0 150px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Category
            </label>
            <select className="form-input" style={{ height: 38, fontSize: '0.82rem' }} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Status */}
          <div style={{ flex: '0 0 130px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Status
            </label>
            <select className="form-input" style={{ height: 38, fontSize: '0.82rem' }} value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Sort */}
          <div style={{ flex: '0 0 130px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Sort by
            </label>
            <select className="form-input" style={{ height: 38, fontSize: '0.82rem' }} value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', alignSelf: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-sm"
              style={{ background: ACCENT, color: '#fff', borderColor: ACCENT, height: 38 }}
            >
              Search
            </button>
            {hasFilters && (
              <button type="button" className="btn btn-secondary btn-sm" style={{ height: 38 }} onClick={clearFilters}>
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Product Table ─────────────────────────────────────────────── */}
      {loading ? (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', overflow: 'hidden',
        }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border-light)',
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--color-bg)' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ height: 12, borderRadius: 6, background: 'var(--color-bg)', width: '45%' }} />
                <div style={{ height: 10, borderRadius: 6, background: 'var(--color-bg)', width: '30%' }} />
              </div>
            </div>
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} } div[style*="bg-bg"]{animation:pulse 1.5s infinite}`}</style>
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          hasFilters={hasFilters}
          onClear={clearFilters}
          onAdd={() => navigate('/farmer/products/new')}
        />
      ) : (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-off-white)', borderBottom: '2px solid var(--color-border)' }}>
                  {['Product', 'Price', 'Stock', 'Status', 'Listed', 'Actions'].map((h) => (
                    <th key={h} style={{
                      padding: '0.75rem 1rem', textAlign: 'left',
                      fontSize: '0.68rem', fontWeight: 700,
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <ProductRow
                    key={p._id}
                    p={p}
                    fmtDate={fmtDate}
                    onView={(id) => navigate(`/farmer/products/${id}`)}
                    onEdit={(id) => navigate(`/farmer/products/${id}/edit`)}
                    onArchive={(id, name) => setArchiveModal({ open: true, id, name })}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer summary */}
          <div style={{
            padding: '0.75rem 1.25rem', borderTop: '1px solid var(--color-border-light)',
            fontSize: '0.75rem', color: 'var(--color-text-muted)',
            background: 'var(--color-off-white)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>Showing {products.length} of {pagination.total} product{pagination.total !== 1 ? 's' : ''}</span>
            <span>Page {pagination.page} of {pagination.pages}</span>
          </div>
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onPage={load} />

      <ConfirmModal
        isOpen={archiveModal.open}
        title="Archive this product?"
        message={`"${archiveModal.name}" will be hidden from the marketplace. Existing orders will not be affected and you can restore it later.`}
        confirmLabel="Archive"
        danger
        onConfirm={handleArchive}
        onCancel={() => setArchiveModal({ open: false, id: null, name: '' })}
        loading={archiveLoading}
      />
    </div>
  );
};

export default ProductsList;