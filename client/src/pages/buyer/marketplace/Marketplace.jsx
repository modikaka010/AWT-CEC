/**
 * Marketplace.jsx  –  Buyer: Browse & shop products
 *
 * Drop-in replacement for the original file.
 * All API calls, service imports, and routing are preserved exactly.
 * Only the UI layer is changed.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProducts, addToCart } from '../../../services/buyerService';
import Pagination from '../../../components/admin/Pagination';

/* ── Constants ─────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { value: '', label: 'All Categories', icon: '🌐' },
  { value: 'Grains & Cereals', label: 'Grains & Cereals', icon: '🌾' },
  { value: 'Vegetables', label: 'Vegetables', icon: '🥦' },
  { value: 'Fruits', label: 'Fruits', icon: '🍎' },
  { value: 'Pulses & Legumes', label: 'Pulses & Legumes', icon: '🫘' },
  { value: 'Oilseeds', label: 'Oilseeds', icon: '🌻' },
  { value: 'Spices & Herbs', label: 'Spices & Herbs', icon: '🌿' },
  { value: 'Dairy & Livestock', label: 'Dairy & Livestock', icon: '🥛' },
  { value: 'Flowers', label: 'Flowers', icon: '🌸' },
  { value: 'Other', label: 'Other', icon: '📦' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price_asc', label: 'Price: low → high' },
  { value: 'price_desc', label: 'Price: high → low' },
];

const STOCK_STATUS_COLOR = (qty) => {
  if (qty <= 0) return 'var(--color-error)';
  if (qty <= 10) return 'var(--color-warning)';
  return 'var(--color-success)';
};

/* ── Sub-components ─────────────────────────────────────────────────────── */

const Toast = ({ msg, onDismiss }) => {
  if (!msg) return null;
  const isError = msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('error');
  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1000,
        background: isError ? 'var(--color-error)' : 'var(--color-success)',
        color: '#fff', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-lg)',
        fontWeight: 600, fontSize: '0.85rem', boxShadow: 'var(--shadow-lg)',
        cursor: 'pointer', maxWidth: 320, animation: 'fadeSlideUp 0.25s ease',
      }}
    >
      {isError ? '⚠️' : '✅'} {msg}
    </div>
  );
};

const ProductCard = ({ product: p, onCart, onView }) => {
  const [hovered, setHovered] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const fmtPrice = (price, unit) =>
    `₹${price?.toLocaleString('en-IN')}${unit ? ` / ${unit.replace('per ', '')}` : ''}`;

  const cat = CATEGORIES.find((c) => c.value === p.category);

  return (
    <article
      onClick={() => onView(p._id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--color-surface)',
        border: `1.5px solid ${hovered ? 'var(--color-primary-light)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'var(--transition)',
        boxShadow: hovered ? 'var(--shadow-hover)' : 'var(--shadow-card)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 180, background: 'var(--color-primary-subtle)', flexShrink: 0 }}>
        {p.images?.[0] && !imgFailed ? (
          <img
            src={p.images[0]} alt={p.name}
            onError={() => setImgFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            <span style={{ fontSize: '3rem' }}>{cat?.icon || '🌾'}</span>
          </div>
        )}
        {/* Category pill */}
        <span style={{
          position: 'absolute', top: 10, left: 10,
          background: 'rgba(23, 76, 56, 0.85)',
          backdropFilter: 'blur(6px)',
          color: '#fff', fontSize: '0.65rem', fontWeight: 700,
          padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
          letterSpacing: '0.02em',
        }}>
          {cat?.icon} {p.category}
        </span>
        {/* Low stock warning */}
        {p.quantity <= 10 && p.quantity > 0 && (
          <span style={{
            position: 'absolute', top: 10, right: 10,
            background: 'var(--color-warning-bg)', color: 'var(--color-warning)',
            border: '1px solid var(--color-warning-border)',
            fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.45rem',
            borderRadius: 'var(--radius-full)',
          }}>
            Only {p.quantity} left
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '1rem 1.1rem 1.1rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
        <div>
          <h3 style={{
            fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)',
            margin: 0, lineHeight: 1.35,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {p.name}
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>👨‍🌾</span>
            <span>{p.farmer?.name || 'Unknown Farmer'}</span>
            {p.location?.district && <><span>·</span><span>{p.location.district}</span></>}
          </p>
        </div>

        {/* Price + Stock */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '0.4rem' }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--color-primary)', margin: 0, lineHeight: 1.2 }}>
              {fmtPrice(p.price, p.priceUnit)}
            </p>
            <p style={{ fontSize: '0.68rem', color: STOCK_STATUS_COLOR(p.quantity), fontWeight: 600, margin: '0.15rem 0 0' }}>
              {p.quantity <= 0 ? 'Out of stock' : `${p.quantity} ${p.quantityUnit} available`}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onView(p._id); }}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
          >
            Details
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onCart(p._id, p.name); }}
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
            disabled={p.quantity <= 0}
          >
            + Cart
          </button>
        </div>
      </div>
    </article>
  );
};

const EmptyState = ({ hasFilters, onClear, onBrowse }) => (
  <div style={{
    textAlign: 'center', padding: '4rem 2rem',
    background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)',
    border: '1.5px dashed var(--color-border)',
  }}>
    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🌾</span>
    <h3 style={{ fontWeight: 700, fontSize: '1.05rem', margin: '0 0 0.4rem' }}>
      {hasFilters ? 'No products match your filters' : 'No products listed yet'}
    </h3>
    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: '0 0 1.25rem' }}>
      {hasFilters
        ? 'Try adjusting your search or clearing some filters.'
        : 'Check back soon — farmers are listing fresh produce daily.'}
    </p>
    {hasFilters && (
      <button className="btn btn-secondary btn-sm" onClick={onClear}>
        Clear all filters
      </button>
    )}
  </div>
);

/* ── Main Component ─────────────────────────────────────────────────────── */
const Marketplace = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartMsg, setCartMsg] = useState('');

  // Filters
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const hasActiveFilters = !!(search || category || minPrice || maxPrice);

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError('');
    try {
      const params = { page, limit: 16, sort };
      if (search)   params.search   = search;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const res = await getProducts(params);
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } catch {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, minPrice, maxPrice]);

  useEffect(() => { load(1); }, [load]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput.trim()); };

  const handleAddToCart = async (productId, productName) => {
    try {
      await addToCart(productId, 1);
      setCartMsg(`"${productName}" added to cart!`);
      setTimeout(() => setCartMsg(''), 3500);
    } catch (err) {
      setCartMsg(err.response?.data?.message || 'Failed to add to cart.');
      setTimeout(() => setCartMsg(''), 3500);
    }
  };

  const clearAllFilters = () => {
    setSearch(''); setSearchInput(''); setCategory('');
    setMinPrice(''); setMaxPrice('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.35rem', margin: 0, color: 'var(--color-text)' }}>
            Marketplace
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0.2rem 0 0' }}>
            {loading ? 'Loading…' : `${pagination.total} product${pagination.total !== 1 ? 's' : ''} available from farmers near you`}
          </p>
        </div>
        <button
          onClick={() => navigate('/buyer/cart')}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.4rem' }}
        >
          🛒 View Cart
        </button>
      </div>

      {/* ── Search + Filters ────────────────────────────────────────── */}
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)', padding: '1.1rem 1.25rem',
        display: 'flex', flexDirection: 'column', gap: '0.875rem',
      }}>
        {/* Search bar row */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.625rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
              fontSize: '0.9rem', color: 'var(--color-text-muted)', pointerEvents: 'none',
            }}>🔍</span>
            <input
              className="form-input"
              style={{ paddingLeft: '2.2rem' }}
              placeholder="Search products, categories, farmers…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
            Search
          </button>
          {search && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setSearchInput(''); }}>
              ✕
            </button>
          )}
        </form>

        {/* Filter chips row */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Category chips */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {CATEGORIES.slice(0, 6).map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(category === c.value ? '' : c.value)}
                style={{
                  padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  border: `1.5px solid ${category === c.value ? 'var(--color-primary)' : 'var(--color-border-strong)'}`,
                  background: category === c.value ? 'var(--color-primary-muted)' : 'var(--color-surface)',
                  color: category === c.value ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                  transition: 'var(--transition)',
                }}
              >
                {c.icon} {c.label}
              </button>
            ))}
            {/* More categories dropdown */}
            <select
              value={CATEGORIES.slice(6).find((c) => c.value === category) ? category : ''}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                border: `1.5px solid ${CATEGORIES.slice(6).find((c) => c.value === category) ? 'var(--color-primary)' : 'var(--color-border-strong)'}`,
                background: CATEGORIES.slice(6).find((c) => c.value === category) ? 'var(--color-primary-muted)' : 'var(--color-surface)',
                color: 'var(--color-text-secondary)',
                outline: 'none',
              }}
            >
              <option value="">More categories…</option>
              {CATEGORIES.slice(6).map((c) => (
                <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: 'var(--color-border-strong)', flexShrink: 0 }} />

          {/* Sort */}
          <select
            className="form-input"
            style={{ width: 'auto', fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {/* Price filter toggle */}
          <button
            onClick={() => setShowPriceFilter(!showPriceFilter)}
            style={{
              padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
              border: `1.5px solid ${(minPrice || maxPrice) ? 'var(--color-primary)' : 'var(--color-border-strong)'}`,
              background: (minPrice || maxPrice) ? 'var(--color-primary-muted)' : 'var(--color-surface)',
              color: (minPrice || maxPrice) ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
              transition: 'var(--transition)',
            }}
          >
            💰 Price {(minPrice || maxPrice) ? `(₹${minPrice || '0'} – ₹${maxPrice || '∞'})` : 'range'}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              style={{
                padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                border: '1.5px solid var(--color-error-border)',
                background: 'var(--color-error-bg)', color: 'var(--color-error)',
              }}
            >
              ✕ Clear all
            </button>
          )}
        </div>

        {/* Price range inputs (collapsible) */}
        {showPriceFilter && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', paddingTop: '0.25rem', borderTop: '1px solid var(--color-border-light)' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>Price range:</label>
            <input
              className="form-input" type="number" placeholder="Min ₹"
              style={{ width: 110, fontSize: '0.8rem', padding: '0.4rem 0.7rem' }}
              value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
            />
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>—</span>
            <input
              className="form-input" type="number" placeholder="Max ₹"
              style={{ width: 110, fontSize: '0.8rem', padding: '0.4rem 0.7rem' }}
              value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
            />
            {(minPrice || maxPrice) && (
              <button className="btn btn-secondary btn-sm" onClick={() => { setMinPrice(''); setMaxPrice(''); }}>
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {/* ── Product Grid ─────────────────────────────────────────────── */}
      {loading ? (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem',
        }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              height: 330, background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)', overflow: 'hidden',
            }}>
              <div style={{ height: 180, background: 'var(--color-bg)' }} />
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[90, 55, 70].map((w, j) => (
                  <div key={j} style={{
                    height: 12, borderRadius: 6, background: 'var(--color-bg)', width: `${w}%`,
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState hasFilters={hasActiveFilters} onClear={clearAllFilters} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {products.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              onCart={handleAddToCart}
              onView={(id) => navigate(`/buyer/marketplace/${id}`)}
            />
          ))}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onPage={load} />

      {/* Toast notification */}
      <Toast msg={cartMsg} onDismiss={() => setCartMsg('')} />

      {/* Pulse keyframe for skeleton */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Marketplace;