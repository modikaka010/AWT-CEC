import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../../../components/admin/StatusBadge';
import ConfirmModal from '../../../components/admin/ConfirmModal';
import { getOrderById as fetchOrder, updateOrderStatus as changeStatus } from '../../../services/farmerService';

const ACCENT = '#1a6b1a';

const VALID_TRANSITIONS = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
};

const STATUS_LABELS = {
  confirmed:  { label:'✅ Confirm Order',     style:{ background:ACCENT, color:'#fff', borderColor:ACCENT } },
  processing: { label:'⚙️ Mark Processing',   style:{ background:'#d4850a', color:'#fff', borderColor:'#d4850a' } },
  shipped:    { label:'🚚 Mark as Shipped',   style:{ background:'#7c3aed', color:'#fff', borderColor:'#7c3aed' } },
  delivered:  { label:'🎉 Mark Delivered',    style:{ background:'#1a7a1a', color:'#fff', borderColor:'#1a7a1a' } },
  cancelled:  { label:'🚫 Cancel Order',      style:{ background:'var(--color-error-bg)', color:'var(--color-error)', border:'1px solid #f5c6c3' } },
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [modal, setModal] = useState({ open:false, action:'', label:'' });
  const [actionNote, setActionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetchOrder(id);
      setOrder(res.data.data.order);
    } catch (e) {
      setError(e.response?.data?.message || 'Order not found.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      await changeStatus(id, { status: modal.action, note: actionNote.trim() || undefined });
      setSuccessMsg(`Order status updated to "${modal.action}".`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setModal({ open:false, action:'', label:'' });
      setActionNote('');
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update order.');
      setModal({ open:false, action:'', label:'' });
    } finally { setActionLoading(false); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
  const fmtCurrency = (n) => `₹${(n||0).toLocaleString('en-IN')}`;

  if (loading) return <div style={{ padding:'2rem', textAlign:'center', color:'var(--color-text-muted)' }}>Loading…</div>;
  if (!order) return <div className="alert alert-error">{error || 'Order not found.'}</div>;

  const nextActions = VALID_TRANSITIONS[order.status] || [];

  return (
    <div style={{ maxWidth:760 }}>
      <button onClick={() => navigate('/farmer/orders')} style={{ display:'flex', alignItems:'center', gap:'0.4rem', color:ACCENT, fontWeight:600, fontSize:'0.85rem', background:'none', border:'none', cursor:'pointer', marginBottom:'1.25rem' }}>
        ← Back to Orders
      </button>

      {successMsg && <div className="alert alert-success" style={{ marginBottom:'1rem' }}>{successMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom:'1rem' }}>{error}</div>}

      {/* Header */}
      <div style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', padding:'1.5rem', marginBottom:'1.25rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <p style={{ fontSize:'0.75rem', color:'var(--color-text-muted)', margin:0 }}>Order ID</p>
            <code style={{ fontSize:'0.875rem', fontWeight:700 }}>#{String(order._id).slice(-8).toUpperCase()}</code>
            <p style={{ fontSize:'0.78rem', color:'var(--color-text-muted)', margin:'0.25rem 0 0' }}>{fmtDate(order.createdAt)}</p>
          </div>
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center' }}>
            <StatusBadge status={order.status} size="md" />
            <StatusBadge status={order.paymentStatus} size="md" />
            <button onClick={() => navigate(`/farmer/orders/${id}/tracking`)} className="btn btn-secondary btn-sm">📍 Tracking</button>
          </div>
        </div>
      </div>

      {/* Items */}
      <div style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', padding:'1.5rem', marginBottom:'1.25rem' }}>
        <h3 style={{ fontWeight:700, fontSize:'1rem', margin:'0 0 1rem' }}>🧾 Items</h3>
        {order.items?.map((item, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.75rem 1rem', background:'var(--color-off-white)', borderRadius:'var(--radius-md)', marginBottom:'0.5rem', flexWrap:'wrap', gap:'0.5rem' }}>
            <div>
              <p style={{ fontWeight:600, fontSize:'0.875rem', margin:0 }}>{item.productName}</p>
              <p style={{ fontSize:'0.75rem', color:'var(--color-text-muted)', margin:0 }}>
                {item.quantity} × {fmtCurrency(item.priceAtOrder)} {item.priceUnit}
              </p>
            </div>
            <strong style={{ color:ACCENT }}>{fmtCurrency(item.quantity * item.priceAtOrder)}</strong>
          </div>
        ))}
        <div style={{ display:'flex', justifyContent:'flex-end', padding:'0.75rem 1rem', borderTop:'2px solid var(--color-border)', marginTop:'0.5rem' }}>
          <strong style={{ fontSize:'1.1rem' }}>Total: {fmtCurrency(order.totalAmount)}</strong>
        </div>
      </div>

      {/* Buyer + Delivery + Payment */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(210px, 1fr))', gap:'1.25rem', marginBottom:'1.25rem' }}>
        <div style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', padding:'1.25rem' }}>
          <h3 style={{ fontWeight:700, fontSize:'0.9rem', margin:'0 0 0.875rem' }}>🧑‍💼 Buyer</h3>
          {[['Name', order.buyer?.name], ['Login ID', order.buyer?.loginId], ['Mobile', order.buyer?.mobile], ['Email', order.buyer?.email]].map(([l,v]) => (
            <div key={l} style={{ marginBottom:'0.5rem' }}>
              <p style={{ fontSize:'0.68rem', fontWeight:700, color:'var(--color-text-muted)', textTransform:'uppercase', margin:'0 0 0.1rem' }}>{l}</p>
              <p style={{ fontSize:'0.82rem', fontWeight:500, margin:0 }}>{v || '—'}</p>
            </div>
          ))}
          <button onClick={() => navigate(`/farmer/chat/${order.buyer?._id}`)} className="btn btn-secondary btn-sm" style={{ marginTop:'0.5rem', width:'100%' }}>
            💬 Chat with Buyer
          </button>
        </div>

        <div style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', padding:'1.25rem' }}>
          <h3 style={{ fontWeight:700, fontSize:'0.9rem', margin:'0 0 0.875rem' }}>📍 Delivery</h3>
          <p style={{ fontSize:'0.875rem', lineHeight:1.7, margin:0 }}>
            {[order.deliveryAddress?.line1, order.deliveryAddress?.city, order.deliveryAddress?.state, order.deliveryAddress?.pincode].filter(Boolean).join(', ') || '—'}
          </p>
          {order.notes && <p style={{ fontSize:'0.78rem', color:'var(--color-text-muted)', marginTop:'0.75rem', borderTop:'1px solid var(--color-border)', paddingTop:'0.5rem' }}>📝 {order.notes}</p>}
        </div>

        <div style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', padding:'1.25rem' }}>
          <h3 style={{ fontWeight:700, fontSize:'0.9rem', margin:'0 0 0.875rem' }}>💳 Payment</h3>
          {[['Method', order.paymentMethod?.toUpperCase()], ['Status', <StatusBadge status={order.paymentStatus} size="xs" key="ps" />], ['Total', fmtCurrency(order.totalAmount)]].map(([l,v]) => (
            <div key={l} style={{ marginBottom:'0.5rem' }}>
              <p style={{ fontSize:'0.68rem', fontWeight:700, color:'var(--color-text-muted)', textTransform:'uppercase', margin:'0 0 0.1rem' }}>{l}</p>
              <p style={{ fontSize:'0.82rem', fontWeight:500, margin:0 }}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {nextActions.length > 0 && (
        <div style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', padding:'1.25rem', display:'flex', gap:'0.625rem', flexWrap:'wrap' }}>
          {nextActions.map((action) => {
            const cfg = STATUS_LABELS[action];
            return cfg ? (
              <button key={action} onClick={() => setModal({ open:true, action, label: cfg.label })} className="btn btn-sm" style={cfg.style}>
                {cfg.label}
              </button>
            ) : null;
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={modal.open}
        title={modal.label}
        message={`Update order status to "${modal.action}"?`}
        confirmLabel={modal.label}
        danger={modal.action === 'cancelled'}
        onConfirm={handleAction}
        onCancel={() => { setModal({ open:false, action:'', label:'' }); setActionNote(''); }}
        loading={actionLoading}
      >
        <div style={{ marginTop:'0.5rem' }}>
          <label style={{ fontSize:'0.8rem', fontWeight:600, display:'block', marginBottom:'0.4rem' }}>Note (optional)</label>
          <textarea className="form-input" rows={2} placeholder="Add a note for the buyer…" value={actionNote} onChange={(e) => setActionNote(e.target.value)} style={{ resize:'vertical' }} />
        </div>
      </ConfirmModal>
    </div>
  );
};

export default OrderDetail;
