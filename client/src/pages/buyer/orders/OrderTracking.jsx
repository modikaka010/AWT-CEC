import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderTracking } from '../../../services/buyerService';
import StatusBadge from '../../../components/admin/StatusBadge';

const STEP_ICONS = { pending: '📋', confirmed: '✅', processing: '⚙️', shipped: '🚚', delivered: '🎉' };
const STEP_DESC  = {
  pending:    'Order placed and waiting for farmer confirmation.',
  confirmed:  'Farmer has confirmed your order.',
  processing: 'Farmer is preparing and packaging your order.',
  shipped:    'Your order is on its way.',
  delivered:  'Order delivered successfully!',
};

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrderTracking(id)
      .then((res) => setData(res.data.data))
      .catch((e) => setError(e.response?.data?.message || 'Failed to load tracking.'))
      .finally(() => setLoading(false));
  }, [id]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading tracking…</div>;
  if (!data) return <div className="alert alert-error">{error || 'Tracking not found.'}</div>;

  const { order, steps, currentStep, isCancelled } = data;

  return (
    <div style={{ maxWidth: 640 }}>
      <button onClick={() => navigate(`/buyer/orders/${id}`)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c4840e', fontWeight: 600, fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.25rem' }}>
        ← Back to Order
      </button>

      {/* Header */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.125rem', margin: 0 }}>📍 Order Tracking</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0.2rem 0 0' }}>
              Order #{String(order._id).slice(-8).toUpperCase()} · {order.farmer?.name}
            </p>
          </div>
          <StatusBadge status={order.status} size="md" />
        </div>
      </div>

      {/* Cancelled state */}
      {isCancelled ? (
        <div style={{ background: 'var(--color-error-bg)', border: '1px solid #f5c6c3', borderRadius: 'var(--radius-xl)', padding: '2rem', textAlign: 'center', marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚫</p>
          <p style={{ fontWeight: 700, color: 'var(--color-error)', fontSize: '1.1rem', margin: '0 0 0.5rem' }}>Order Cancelled</p>
          <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', margin: 0 }}>
            {order.statusHistory?.find((h) => h.status === 'cancelled')?.note || 'This order has been cancelled.'}
          </p>
        </div>
      ) : (
        /* Progress steps */
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {steps.map((step, i) => {
              const isDone    = i < currentStep;
              const isCurrent = i === currentStep;
              const isPending = i > currentStep;
              const historyEntry = order.statusHistory?.find((h) => h.status === step);

              return (
                <div key={step} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', paddingBottom: i < steps.length - 1 ? '1.5rem' : 0, position: 'relative' }}>
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div style={{ position: 'absolute', left: 20, top: 42, bottom: 0, width: 2, background: isDone ? '#c4840e' : 'var(--color-border)' }} />
                  )}

                  {/* Step circle */}
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', zIndex: 1,
                    background: isDone ? '#c4840e' : isCurrent ? '#fef3dc' : 'var(--color-off-white)',
                    border: `2px solid ${isDone || isCurrent ? '#c4840e' : 'var(--color-border)'}`,
                  }}>
                    {isDone ? '✓' : STEP_ICONS[step]}
                  </div>

                  {/* Step info */}
                  <div style={{ paddingTop: '0.5rem', flex: 1 }}>
                    <p style={{ fontWeight: isCurrent ? 800 : isDone ? 600 : 400, fontSize: '0.9rem', margin: '0 0 0.2rem', color: isCurrent ? '#c4840e' : isDone ? 'var(--color-text)' : 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                      {step}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                      {STEP_DESC[step]}
                    </p>
                    {historyEntry?.changedAt && (
                      <p style={{ fontSize: '0.72rem', color: isCurrent ? '#c4840e' : 'var(--color-text-muted)', margin: '0.25rem 0 0', fontWeight: isCurrent ? 600 : 400 }}>
                        {fmtDate(historyEntry.changedAt)}
                        {historyEntry.note && ` — ${historyEntry.note}`}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status history */}
      {order.statusHistory?.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0 0 1rem' }}>🕐 Activity Timeline</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[...order.statusHistory].reverse().map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c4840e', marginTop: '0.3rem', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>{h.status}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    {fmtDate(h.changedAt)}{h.note ? ` — ${h.note}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
