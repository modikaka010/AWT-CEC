/**
 * MyOrders.jsx  –  Buyer: Order history & management
 *
 * Drop-in replacement for the original file.
 * All API calls, service imports, and routing are preserved exactly.
 * Only the UI layer is changed.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getOrders } from '../../../services/buyerService';
import StatusBadge from '../../../components/admin/StatusBadge';
import Pagination from '../../../components/admin/Pagination';

/* ── Constants ─────────────────────────────────────────────────────────── */
const STATUS_TABS = [
  { value: '', label: 'All', icon: '📦' },
  { value: 'pending', label: 'Pending', icon: '⏳' },
  { value: 'confirmed', label: 'Confirmed', icon: '✅' },
  { value: 'processing', label: 'Processing', icon: '⚙️' },
  { value: 'shipped', label: 'Shipped', icon: '🚚' },
  { value: 'delivered', label: 'Delivered', icon: '🏡' },
  { value: 'cancelled', label: 'Cancelled', icon: '✕' },
];

const BUYER_ACCENT = '#c4840e';

/* ── Progress timeline for each status ─────────────────────────────────── */
const ORDER_PROGRESS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const OrderProgress = ({ status }) => {
  if (status === 'cancelled') return null;
  const currentIdx = ORDER_PROGRESS.indexOf(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: '0.875rem' }}>
      {ORDER_PROGRESS.map((step, i) => {
        const done = i <= currentIdx;
        const current = i === currentIdx;
        return (
          <React.Fragment key={step}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', minWidth: 0, flex: '0 0 auto',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: done ? BUYER_ACCENT : 'var(--color-off-white)',
                border: `2px solid ${done ? BUYER_ACCENT : 'var(--color-border-strong)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', color: done ? '#fff' : 'var(--color-text-muted)',
                fontWeight: 700, flexShrink: 0,
                boxShadow: current ? `0 0 0 3px rgba(196,132,14,0.2)` : 'none',
                transition: 'var(--transition)',
              }}>
                {done ? (current ? '●' : '✓') : '○'}
              </div>
              <span style={{
                fontSize: '0.58rem', fontWeight: current ? 700 : 500,
                color: done ? BUYER_ACCENT : 'var(--color-text-muted)',
                textAlign: 'center', lineHeight: 1.2, whiteSpace: 'nowrap',
                textTransform: 'capitalize',
              }}>
                {step}
              </span>
            </div>
            {i < ORDER_PROGRESS.length - 1 && (
              <div style={{
                flex: 1, height: 2, minWidth: 12,
                background: i < currentIdx ? BUYER_ACCENT : 'var(--color-border)',
                transition: 'background 0.3s',
                margin: '0 0.25rem',
                marginTop: '-0.875rem', // vertically align with circles
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ── Order card ──────────────────────────────────────────────────────── */
const OrderCard = ({ order: o, onView, onTrack, fmtDate, fmtCurrency }) => {
  const [hovered, setHovered] = useState(false);
  const isCancelled = o.status === 'cancelled';
  const isDelivered = o.status === 'delivered';

  return (
    <article
      onClick={() => onView(o._id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--color-surface)',
        border: `1.5px solid ${hovered ? BUYER_ACCENT : isCancelled ? 'var(--color-error-border)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem 1.5rem',
        cursor: 'pointer',
        transition: 'var(--transition)',
        boxShadow: hovered ? 'var(--shadow-hover)' : 'var(--shadow-card)',
        opacity: isCancelled ? 0.75 : 1,
      }}
    >
      {/* Top row: order ID + status + amount */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.625rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
            <code style={{
              fontSize: '0.72rem', fontWeight: 700,
              background: 'var(--color-off-white)',
              border: '1px solid var(--color-border)',
              padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text)',
            }}>
              #{String(o._id).slice(-8).toUpperCase()}
            </code>
            <StatusBadge status={o.status} size="xs" />
            {o.paymentStatus && o.paymentStatus !== o.status && (
              <StatusBadge status={o.paymentStatus} size="xs" />
            )}
          </div>

          <p style={{ fontWeight: 700, fontSize: '0.925rem', margin: '0 0 0.2rem', color: 'var(--color-text)', lineHeight: 1.35 }}>
            {o.items?.[0]?.productName || 'Order'}
            {o.items?.length > 1 && (
              <span style={{ fontWeight: 500, color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                {' '}+{o.items.length - 1} more item{o.items.length - 1 !== 1 ? 's' : ''}
              </span>
            )}
          </p>

          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>👨‍🌾</span>
            <span>From {o.farmer?.name || '—'}</span>
            <span style={{ color: 'var(--color-border-strong)' }}>·</span>
            <span>{fmtDate(o.createdAt)}</span>
          </p>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontWeight: 900, fontSize: '1.2rem', color: BUYER_ACCENT, margin: '0 0 0.5rem', letterSpacing: '-0.01em' }}>
            {fmtCurrency(o.totalAmount)}
          </p>
          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
            {!isCancelled && (
              <button
                onClick={(e) => { e.stopPropagation(); onTrack(o._id); }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem' }}
              >
                📍 Track
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onView(o._id); }}
              className="btn btn-sm"
              style={{ fontSize: '0.72rem', background: BUYER_ACCENT, color: '#fff', borderColor: BUYER_ACCENT }}
            >
              View →
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar — only for active orders */}
      {!isCancelled && !isDelivered && (
        <OrderProgress status={o.status} />
      )}

      {/* Delivered message */}
      {isDelivered && (
        <div style={{
          marginTop: '0.875rem', padding: '0.5rem 0.875rem',
          background: 'var(--color-success-bg)', borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <span style={{ fontSize: '0.9rem' }}>🎉</span>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-success)', margin: 0 }}>
            Delivered — enjoy your purchase!
          </p>
        </div>
      )}

      {/* Cancelled message */}
      {isCancelled && (
        <div style={{
          marginTop: '0.875rem', padding: '0.5rem 0.875rem',
          background: 'var(--color-error-bg)', borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <span style={{ fontSize: '0.9rem' }}>✕</span>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-error)', margin: 0 }}>
            This order was cancelled
            {o.cancellationReason ? ` — ${o.cancellationReason}` : '.'}
          </p>
        </div>
      )}
    </article>
  );
};

/* ── Skeleton loading card ──────────────────────────────────────────── */
const SkeletonCard = () => (
  <div style={{
    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-xl)', padding: '1.25rem 1.5rem',
    display: 'flex', flexDirection: 'column', gap: '0.625rem',
  }}>
    {[70, 45, 30].map((w, i) => (
      <div key={i} style={{
        height: i === 0 ? 14 : 12, borderRadius: 6,
        background: 'var(--color-bg)', width: `${w}%`,
        animation: 'skPulse 1.5s ease-in-out infinite',
      }} />
    ))}
    <style>{`@keyframes skPulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
  </div>
);

/* ── Empty State ─────────────────────────────────────────────────────── */
const EmptyState = ({ statusFilter, onShop }) => (
  <div style={{
    textAlign: 'center', padding: '4rem 2rem',
    background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)',
    border: '1.5px dashed var(--color-border)',
  }}>
    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📭</span>
    <h3 style={{ fontWeight: 700, fontSize: '1.05rem', margin: '0 0 0.4rem' }}>
      {statusFilter ? `No ${statusFilter} orders` : 'No orders yet'}
    </h3>
    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: '0 0 1.25rem' }}>
      {statusFilter
        ? `You don't have any ${statusFilter} orders right now.`
        : 'When you place an order, it will appear here.'}
    </p>
    {!statusFilter && (
      <button
        className="btn btn-sm"
        style={{ background: BUYER_ACCENT, color: '#fff', borderColor: BUYER_ACCENT }}
        onClick={onShop}
      >
        Browse marketplace
      </button>
    )}
  </div>
);

/* ── Main Component ─────────────────────────────────────────────────── */
const MyOrders = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError('');
    try {
      const res = await getOrders({ status: statusFilter || undefined, page, limit: 15 });
      setOrders(res.data.data.orders);
      setPagination(res.data.data.pagination);
    } catch {
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(1); }, [load]);

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  const fmtCurrency = (n) => `₹${n?.toLocaleString('en-IN') || '0'}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div>
        <h2 style={{ fontWeight: 800, fontSize: '1.35rem', margin: 0 }}>My Orders</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0.2rem 0 0' }}>
          {loading ? 'Loading…' : `${pagination.total} order${pagination.total !== 1 ? 's' : ''} total`}
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Status tab strip ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: '0.4rem', flexWrap: 'wrap',
        overflowX: 'auto', paddingBottom: '0.25rem',
      }}>
        {STATUS_TABS.map((tab) => {
          const active = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                border: `1.5px solid ${active ? BUYER_ACCENT : 'var(--color-border-strong)'}`,
                background: active ? BUYER_ACCENT : 'var(--color-surface)',
                color: active ? '#fff' : 'var(--color-text-secondary)',
                transition: 'var(--transition)',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: '0.8rem' }}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Order list ───────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState statusFilter={statusFilter} onShop={() => navigate('/buyer/marketplace')} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {orders.map((o) => (
            <OrderCard
              key={o._id}
              order={o}
              fmtDate={fmtDate}
              fmtCurrency={fmtCurrency}
              onView={(id) => navigate(`/buyer/orders/${id}`)}
              onTrack={(id) => navigate(`/buyer/orders/${id}/tracking`)}
            />
          ))}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onPage={load} />
    </div>
  );
};

export default MyOrders;