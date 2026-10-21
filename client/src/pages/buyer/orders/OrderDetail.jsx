import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getOrderById, cancelOrder } from '../../../services/buyerService';
import StatusBadge from '../../../components/admin/StatusBadge';
import ConfirmModal from '../../../components/admin/ConfirmModal';

const Field = ({ label, value }) => (
  <div>
    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.2rem' }}>{label}</p>
    <p style={{ fontWeight: 500, color: 'var(--color-text)', fontSize: '0.875rem', margin: 0 }}>{value || '—'}</p>
  </div>
);

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(location.state?.success ? '🎉 Your order has been placed successfully!' : '');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await getOrderById(id);
      setOrder(res.data.data.order);
    } catch (e) {
      setError(e.response?.data?.message || 'Order not found.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await cancelOrder(id, cancelReason.trim() || 'Cancelled by buyer.');
      setCancelModal(false);
      setSuccessMsg('Order cancelled successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to cancel order.');
      setCancelModal(false);
    } finally { setCancelLoading(false); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
  const fmtCurrency = (n) => `₹${n?.toLocaleString('en-IN') || '0'}`;
  const canCancel = order && ['pending', 'confirmed'].includes(order.status);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</div>;
  if (!order) return <div className="alert alert-error">{error || 'Order not found.'}</div>;

  return (
    <div style={{ maxWidth: 760 }}>
      <button onClick={() => navigate('/buyer/orders')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c4840e', fontWeight: 600, fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.25rem' }}>
        ← Back to Orders
      </button>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Header */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Order ID</p>
            <code style={{ fontSize: '0.875rem', fontWeight: 700 }}>#{String(order._id).slice(-8).toUpperCase()}</code>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>{fmtDate(order.createdAt)}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <StatusBadge status={order.status} size="md" />
            <StatusBadge status={order.paymentStatus} size="md" />
            <button onClick={() => navigate(`/buyer/orders/${id}/tracking`)} className="btn btn-secondary btn-sm">
              📍 Track Order
            </button>
          </div>
        </div>
      </div>

      {/* Items */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 1rem' }}>🧾 Order Items</h3>
        {order.items?.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--color-off-white)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>{item.productName}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                {item.quantity} × {fmtCurrency(item.priceAtOrder)} {item.priceUnit}
              </p>
            </div>
            <strong style={{ color: '#c4840e' }}>{fmtCurrency(item.quantity * item.priceAtOrder)}</strong>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 1rem', borderTop: '2px solid var(--color-border)', marginTop: '0.5rem' }}>
          <strong style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>Total: {fmtCurrency(order.totalAmount)}</strong>
        </div>
      </div>

      {/* Farmer + Delivery + Payment */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0 0 0.875rem' }}>👨‍🌾 Farmer</h3>
          <Field label="Name"     value={order.farmer?.name} />
          <div style={{ marginTop: '0.625rem' }}><Field label="Login ID" value={order.farmer?.loginId} /></div>
          <div style={{ marginTop: '0.625rem' }}><Field label="Mobile"   value={order.farmer?.mobile} /></div>
          <button onClick={() => navigate(`/buyer/chat/${order.farmer?._id}`)} className="btn btn-secondary btn-sm" style={{ marginTop: '0.875rem', width: '100%' }}>
            💬 Chat with Farmer
          </button>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0 0 0.875rem' }}>📍 Delivery Address</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.6, margin: 0 }}>
            {[order.deliveryAddress?.line1, order.deliveryAddress?.city, order.deliveryAddress?.state, order.deliveryAddress?.pincode].filter(Boolean).join(', ') || '—'}
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0 0 0.875rem' }}>💳 Payment</h3>
          <Field label="Method" value={order.paymentMethod?.toUpperCase()} />
          <div style={{ marginTop: '0.625rem' }}><Field label="Status" value={<StatusBadge status={order.paymentStatus} />} /></div>
          <div style={{ marginTop: '0.625rem' }}><Field label="Total"  value={fmtCurrency(order.totalAmount)} /></div>
        </div>
      </div>

      {/* Cancel action */}
      {canCancel && (
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem' }}>
          <button onClick={() => { setCancelModal(true); setCancelReason(''); }} className="btn btn-sm" style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)', border: '1px solid #f5c6c3' }}>
            🚫 Cancel Order
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={cancelModal}
        title="Cancel Order"
        message="Are you sure you want to cancel this order?"
        confirmLabel="Yes, Cancel Order"
        danger
        onConfirm={handleCancel}
        onCancel={() => setCancelModal(false)}
        loading={cancelLoading}
      >
        <div style={{ marginTop: '0.5rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Reason (optional)</label>
          <textarea className="form-input" rows={2} placeholder="Why are you cancelling?" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} style={{ resize: 'vertical' }} />
        </div>
      </ConfirmModal>
    </div>
  );
};

export default OrderDetail;
