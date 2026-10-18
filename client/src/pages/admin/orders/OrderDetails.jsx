import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../../../services/adminService';
import StatusBadge from '../../../components/admin/StatusBadge';

const Field = ({ label, value }) => (
  <div>
    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.2rem' }}>{label}</p>
    <p style={{ fontWeight: 500, color: 'var(--color-text)', fontSize: '0.875rem', margin: 0 }}>{value || '—'}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1rem' }}>{title}</h3>
    {children}
  </div>
);

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getOrderById(id);
        setOrder(res.data.data.order);
      } catch { setError('Failed to load order.'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
  const fmtCurrency = (n) => n !== undefined ? `₹${n.toLocaleString('en-IN')}` : '—';

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</div>;
  if (!order) return <div className="alert alert-error">{error || 'Order not found.'}</div>;

  const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div style={{ maxWidth: 780 }}>
      <button onClick={() => navigate('/admin/orders')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.25rem' }}>
        ← Back to Orders
      </button>

      {/* Header */}
      <Section title="📦 Order Information">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Order ID</p>
            <code style={{ fontSize: '0.875rem', fontWeight: 700 }}>{String(order._id).toUpperCase()}</code>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <StatusBadge status={order.status} size="md" />
            <StatusBadge status={order.paymentStatus} size="md" />
          </div>
        </div>

        {/* Order progress bar */}
        {order.status !== 'cancelled' && (
          <div style={{ margin: '1rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {STATUS_STEPS.map((step, i) => (
                <React.Fragment key={step}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: i <= currentStep ? 'var(--color-primary)' : 'var(--color-border)',
                      color: i <= currentStep ? '#fff' : 'var(--color-text-muted)',
                      fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                    }}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <p style={{ fontSize: '0.62rem', color: i <= currentStep ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: i === currentStep ? 700 : 400, marginTop: '0.3rem', textAlign: 'center' }}>
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </p>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div style={{ height: 2, flex: 1, background: i < currentStep ? 'var(--color-primary)' : 'var(--color-border)', marginBottom: '1.2rem' }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', padding: '1rem', background: 'var(--color-off-white)', borderRadius: 'var(--radius-md)' }}>
          <Field label="Order Date" value={fmtDate(order.createdAt)} />
          <Field label="Total Amount" value={fmtCurrency(order.totalAmount)} />
          <Field label="Payment Method" value={order.paymentMethod?.toUpperCase()} />
          <Field label="Payment Status" value={<StatusBadge status={order.paymentStatus} />} />
        </div>
      </Section>

      {/* Buyer & Farmer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <Section title="🛍️ Buyer">
          <Field label="Name" value={order.buyer?.name} />
          <div style={{ marginTop: '0.75rem' }}><Field label="Email" value={order.buyer?.email} /></div>
          <div style={{ marginTop: '0.75rem' }}><Field label="Mobile" value={order.buyer?.mobile} /></div>
          <div style={{ marginTop: '0.75rem' }}><Field label="Login ID" value={order.buyer?.loginId} /></div>
          <button onClick={() => navigate(`/admin/users/${order.buyer?._id}`)} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>View Profile →</button>
        </Section>
        <Section title="🌾 Farmer">
          <Field label="Name" value={order.farmer?.name} />
          <div style={{ marginTop: '0.75rem' }}><Field label="Email" value={order.farmer?.email} /></div>
          <div style={{ marginTop: '0.75rem' }}><Field label="Mobile" value={order.farmer?.mobile} /></div>
          <div style={{ marginTop: '0.75rem' }}><Field label="Login ID" value={order.farmer?.loginId} /></div>
          <button onClick={() => navigate(`/admin/users/${order.farmer?._id}`)} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>View Profile →</button>
        </Section>
      </div>

      {/* Items */}
      <Section title="🧾 Order Items">
        {order.items?.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No items.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--color-off-white)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>{item.productName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Qty: {item.quantity} × {fmtCurrency(item.priceAtOrder)} {item.priceUnit}</p>
                </div>
                <strong style={{ color: 'var(--color-primary)' }}>{fmtCurrency(item.quantity * item.priceAtOrder)}</strong>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 1rem', borderTop: '2px solid var(--color-border)', marginTop: '0.25rem' }}>
              <strong style={{ fontSize: '1rem', color: 'var(--color-text)' }}>Total: {fmtCurrency(order.totalAmount)}</strong>
            </div>
          </div>
        )}
      </Section>

      {/* Delivery */}
      {order.deliveryAddress?.line1 && (
        <Section title="🏠 Delivery Address">
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.6 }}>
            {[order.deliveryAddress.line1, order.deliveryAddress.city, order.deliveryAddress.state, order.deliveryAddress.pincode].filter(Boolean).join(', ')}
          </p>
        </Section>
      )}

      {/* Timeline */}
      {order.statusHistory?.length > 0 && (
        <Section title="🕐 Order Timeline">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {order.statusHistory.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', marginTop: '0.3rem', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>{h.status}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>{fmtDate(h.changedAt)}{h.note ? ` · ${h.note}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
};

export default OrderDetails;
