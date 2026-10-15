/**
 * IncomingOrders.jsx  –  Farmer: Orders received from buyers
 *
 * Drop-in replacement for the original file.
 * All API calls, service imports, and routing are preserved exactly.
 * Only the UI layer is changed.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders } from '../../../services/farmerService';
import StatusBadge from '../../../components/admin/StatusBadge';
import Pagination from '../../../components/admin/Pagination';

/* ── Constants ─────────────────────────────────────────────────────────── */
const ACCENT = '#1a6b1a';

const STATUS_TABS = [
  { value: '',            label: 'All',         icon: '📋', urgency: false },
  { value: 'pending',     label: 'Pending',     icon: '⚡', urgency: true  },
  { value: 'confirmed',   label: 'Confirmed',   icon: '✅', urgency: false },
  { value: 'processing',  label: 'Processing',  icon: '⚙️', urgency: false },
  { value: 'shipped',     label: 'Shipped',     icon: '🚚', urgency: false },
  { value: 'delivered',   label: 'Delivered',   icon: '🏡', urgency: false },
  { value: 'cancelled',   label: 'Cancelled',   icon: '✕',  urgency: false },
];

/* ── Order urgency label ─────────────────────────────────────────────── */
const urgencyForStatus = (status) => {
  if (status === 'pending') return { label: 'Action needed — Confirm or reject', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', border: 'var(--color-warning-border)', icon: '⚡' };
  if (status === 'confirmed') return { label: 'Ready to process — Start preparing the shipment', color: 'var(--color-info)', bg: 'var(--color-info-bg)', border: 'var(--color-info-border)', icon: '📦' };
  return null;
};

/* ── Order card ─────────────────────────────────────────────────────── */
const OrderCard = ({ order: o, onManage, fmtDate }) => {
  const [hovered, setHovered] = useState(false);
  const urgency = urgencyForStatus(o.status);
  const isCancelled = o.status === 'cancelled';

  return (
    <article
      onClick={() => onManage(o._id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--color-surface)',
        border: `1.5px solid ${
          isCancelled       ? 'var(--color-error-border)'   :
          o.status === 'pending' ? 'var(--color-warning-border)' :
          hovered           ? ACCENT                         :
                              'var(--color-border)'
        }`,
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem 1.5rem',
        cursor: 'pointer',
        transition: 'var(--transition)',
        boxShadow: hovered ? 'var(--shadow-hover)' : 'var(--shadow-card)',
        opacity: isCancelled ? 0.72 : 1,
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>

        {/* Left: ID, product, buyer */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <code style={{
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em',
              background: 'var(--color-off-white)', border: '1px solid var(--color-border)',
              padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)',
            }}>
              #{String(o._id).slice(-8).toUpperCase()}
            </code>
            <StatusBadge status={o.status} size="xs" />
            {o.paymentStatus && o.paymentStatus !== o.status && (
              <StatusBadge status={o.paymentStatus} size="xs" />
            )}
          </div>

          <p style={{ fontWeight: 700, fontSize: '0.925rem', margin: '0 0 0.2rem', color: 'var(--color-text)', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {o.items?.[0]?.productName || 'Order'}
            {o.items?.length > 1 && (
              <span style={{ fontWeight: 500, color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                {' '}+{o.items.length - 1} item{o.items.length - 1 !== 1 ? 's' : ''}
              </span>
            )}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>👤</span>
              <span>{o.buyer?.name || 'Unknown buyer'}</span>
              {o.buyer?.mobile && <><span style={{ color: 'var(--color-border-strong)' }}>·</span><span>{o.buyer.mobile}</span></>}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>🗓</span>
              <span>{fmtDate(o.createdAt)}</span>
            </p>
          </div>
        </div>

        {/* Right: amount + action */}
        <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <p style={{ fontWeight: 900, fontSize: '1.2rem', color: ACCENT, margin: 0, letterSpacing: '-0.01em' }}>
            ₹{o.totalAmount?.toLocaleString('en-IN')}
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); onManage(o._id); }}
            className="btn btn-sm"
            style={{
              background: o.status === 'pending' ? 'var(--color-warning)' : ACCENT,
              color: '#fff',
              borderColor: o.status === 'pending' ? 'var(--color-warning)' : ACCENT,
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          >
            {o.status === 'pending' ? '⚡ Respond' : 'Manage →'}
          </button>
        </div>
      </div>

      {/* Item summary chips */}
      {o.items?.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
          {o.items.slice(0, 3).map((item, i) => (
            <span key={i} style={{
              fontSize: '0.68rem', fontWeight: 600, padding: '0.15rem 0.55rem',
              borderRadius: 'var(--radius-full)', background: 'var(--color-primary-subtle)',
              color: 'var(--color-primary-dark)', border: '1px solid var(--color-border)',
            }}>
              {item.productName} × {item.quantity}
            </span>
          ))}
          {o.items.length > 3 && (
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', padding: '0.15rem 0.35rem', alignSelf: 'center' }}>
              +{o.items.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Urgency banner */}
      {urgency && (
        <div style={{
          marginTop: '0.875rem', padding: '0.5rem 0.875rem',
          background: urgency.bg, border: `1px solid ${urgency.border}`,
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <span style={{ fontSize: '0.875rem' }}>{urgency.icon}</span>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: urgency.color, margin: 0 }}>
            {urgency.label}
          </p>
        </div>
      )}
    </article>
  );
};

/* ── Skeleton loader ─────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div style={{
    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-xl)', padding: '1.25rem 1.5rem',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {[60, 40, 30].map((w, i) => (
          <div key={i} style={{ height: i === 0 ? 14 : 11, borderRadius: 6, background: 'var(--color-bg)', width: `${w}%`, animation: 'skPulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
      <div style={{ width: 80, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', marginLeft: '1rem', animation: 'skPulse 1.5s ease-in-out infinite' }} />
    </div>
    <style>{`@keyframes skPulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
  </div>
);

/* ── Empty state ──────────────────────────────────────────────────────── */
const EmptyState = ({ statusFilter }) => (
  <div style={{
    textAlign: 'center', padding: '4rem 2rem',
    background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)',
    border: '1.5px dashed var(--color-border)',
  }}>
    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>
      {statusFilter === 'pending' ? '⏳' : '📭'}
    </span>
    <h3 style={{ fontWeight: 700, fontSize: '1.05rem', margin: '0 0 0.4rem' }}>
      {statusFilter ? `No ${statusFilter} orders` : 'No orders received yet'}
    </h3>
    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>
      {statusFilter
        ? `You don't have any ${statusFilter} orders right now.`
        : 'Once buyers place orders for your products, they\'ll appear here.'
      }
    </p>
  </div>
);

/* ── Stats bar ───────────────────────────────────────────────────────── */
const StatsBar = ({ orders }) => {
  const pending   = orders.filter((o) => o.status === 'pending').length;
  const confirmed = orders.filter((o) => o.status === 'confirmed').length;
  const shipped   = orders.filter((o) => o.status === 'shipped').length;
  if (!orders.length) return null;

  const stats = [
    { label: 'Need response', value: pending,   color: 'var(--color-warning)', icon: '⚡' },
    { label: 'Confirmed',     value: confirmed, color: ACCENT,                 icon: '✅' },
    { label: 'Shipped',       value: shipped,   color: 'var(--color-info)',    icon: '🚚' },
  ];

  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      {stats.map((s) => (
        <div key={s.label} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', padding: '0.625rem 1rem',
          flex: '1 1 140px',
        }}>
          <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
          <div>
            <p style={{ fontWeight: 800, fontSize: '1.1rem', color: s.color, margin: 0, lineHeight: 1 }}>
              {s.value}
            </p>
            <p style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', margin: 0, fontWeight: 600 }}>
              {s.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────────────────── */
const IncomingOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchApplied, setSearchApplied] = useState('');

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError('');
    try {
      const res = await getOrders({
        status: statusFilter || undefined,
        search: searchApplied || undefined,
        page, limit: 15,
      });
      setOrders(res.data.data.orders);
      setPagination(res.data.data.pagination);
    } catch {
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchApplied]);

  useEffect(() => { load(1); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchApplied(searchInput.trim());
  };

  const clearSearch = () => { setSearchInput(''); setSearchApplied(''); };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.35rem', margin: 0 }}>
            Incoming Orders
            {pendingCount > 0 && !statusFilter && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginLeft: '0.5rem', width: 22, height: 22,
                background: 'var(--color-warning)', color: '#fff',
                borderRadius: '50%', fontSize: '0.65rem', fontWeight: 800, verticalAlign: 'middle',
              }}>
                {pendingCount}
              </span>
            )}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0.2rem 0 0' }}>
            {loading ? 'Loading…' : `${pagination.total} order${pagination.total !== 1 ? 's' : ''} received`}
          </p>
        </div>
      </div>

      {/* ── Quick stats (only when not filtered) ─────────────────────── */}
      {!statusFilter && !loading && <StatsBar orders={orders} />}

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)', padding: '1rem 1.25rem',
        display: 'flex', flexDirection: 'column', gap: '0.875rem',
      }}>
        {/* Status tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.38rem 0.875rem', borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  border: `1.5px solid ${active ? ACCENT : 'var(--color-border-strong)'}`,
                  background: active ? ACCENT : 'var(--color-surface)',
                  color: active ? '#fff' : 'var(--color-text-secondary)',
                  transition: 'var(--transition)',
                }}
              >
                <span style={{ fontSize: '0.8rem' }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <span style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '0.85rem', pointerEvents: 'none' }}>🔍</span>
            <input
              className="form-input"
              style={{ paddingLeft: '2rem' }}
              placeholder="Search by buyer name…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-sm" style={{ background: ACCENT, color: '#fff', borderColor: ACCENT }}>
            Search
          </button>
          {searchApplied && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={clearSearch}>
              ✕ Clear
            </button>
          )}
        </form>
      </div>

      {/* ── Order list ───────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState statusFilter={statusFilter} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {orders.map((o) => (
            <OrderCard
              key={o._id}
              order={o}
              fmtDate={(d) => d
                ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—'}
              onManage={(id) => navigate(`/farmer/orders/${id}`)}
            />
          ))}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onPage={load} />
    </div>
  );
};

export default IncomingOrders;