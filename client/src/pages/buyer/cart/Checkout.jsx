import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, createOrder } from '../../../services/buyerService';
import { useAuth } from '../../../hooks/useAuth';

const PAYMENT_METHODS = [
  { value: 'cod',    label: 'Cash on Delivery', icon: '💵' },
  { value: 'upi',   label: 'UPI / Online',      icon: '📱' },
  { value: 'online', label: 'Bank Transfer',    icon: '🏦' },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    line1: '', city: '', state: '', pincode: '',
    paymentMethod: 'cod', notes: '',
  });

  useEffect(() => {
    getCart()
      .then((res) => {
        const d = res.data.data;
        if (!d.items?.length) { navigate('/buyer/cart'); return; }
        setCartItems(d.items);
        setGrandTotal(d.grandTotal);
      })
      .catch(() => setError('Failed to load cart.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.line1.trim() || !form.city.trim() || !form.state.trim())
      return setError('Delivery address fields (line1, city, state) are required.');

    const orderItems = cartItems.map((i) => ({ productId: String(i.product?._id || i.product), quantity: i.quantity }));

    setSubmitting(true); setError('');
    try {
      const res = await createOrder({
        items: orderItems,
        deliveryAddress: { line1: form.line1.trim(), city: form.city.trim(), state: form.state.trim(), pincode: form.pincode.trim() },
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim() || undefined,
        fromCart: true,
      });
      const orderId = res.data.data.orders?.[0]?._id;
      navigate(orderId ? `/buyer/orders/${orderId}` : '/buyer/orders', {
        state: { success: true, orderCount: res.data.data.orders?.length },
      });
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to place order. Please try again.');
    } finally { setSubmitting(false); }
  };

  const fmtCurrency = (n) => `₹${n?.toLocaleString('en-IN') || '0'}`;

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 820 }}>
      <button onClick={() => navigate('/buyer/cart')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c4840e', fontWeight: 600, fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.25rem' }}>
        ← Back to Cart
      </button>

      <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: '0 0 1.5rem' }}>Checkout</h2>
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
          <div>
            {/* Delivery Address */}
            <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 1.25rem' }}>📍 Delivery Address</h3>
              <div className="form-group">
                <label className="form-label">Street / Area <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input className="form-input" name="line1" value={form.line1} onChange={handleChange} placeholder="House no., Street, Village/Town" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">City / District <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input className="form-input" name="city" value={form.city} onChange={handleChange} placeholder="City" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">State <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input className="form-input" name="state" value={form.state} onChange={handleChange} placeholder="State" />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Pincode</label>
                <input className="form-input" name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" maxLength={6} />
              </div>
            </div>

            {/* Payment Method */}
            <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 1.25rem' }}>💳 Payment Method</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {PAYMENT_METHODS.map((m) => (
                  <label key={m.value} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1rem', background: form.paymentMethod === m.value ? '#fef3dc' : 'var(--color-off-white)', border: `2px solid ${form.paymentMethod === m.value ? '#c4840e' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <input type="radio" name="paymentMethod" value={m.value} checked={form.paymentMethod === m.value} onChange={handleChange} style={{ accentColor: '#c4840e' }} />
                    <span style={{ fontSize: '1.25rem' }}>{m.icon}</span>
                    <span style={{ fontWeight: form.paymentMethod === m.value ? 700 : 500, fontSize: '0.875rem', color: 'var(--color-text)' }}>{m.label}</span>
                  </label>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0.75rem 0 0' }}>
                For UPI/Bank Transfer, payment details will be shared after order confirmation.
              </p>
            </div>

            {/* Notes */}
            <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 1rem' }}>📝 Order Notes (optional)</h3>
              <textarea className="form-input" name="notes" rows={3} value={form.notes} onChange={handleChange}
                placeholder="Special instructions, preferred delivery time, etc." style={{ resize: 'vertical' }} />
            </div>
          </div>

          {/* Order summary */}
          <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', position: 'sticky', top: '1rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 1rem' }}>Order Summary</h3>

            <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: '1rem' }}>
              {cartItems.map((item) => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--color-text)', flex: 1, marginRight: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.productName} × {item.quantity}
                  </span>
                  <span style={{ fontWeight: 600, flexShrink: 0 }}>₹{(item.quantity * item.priceAtAdd).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>Total</span>
              <span style={{ fontWeight: 900, fontSize: '1.375rem', color: '#c4840e' }}>{fmtCurrency(grandTotal)}</span>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-full" style={{ background: '#c4840e', color: '#fff', borderColor: '#c4840e', fontSize: '0.95rem', fontWeight: 700, padding: '0.75rem' }}>
              {submitting ? 'Placing Order…' : '✅ Place Order'}
            </button>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '0.625rem', marginBottom: 0 }}>
              By placing this order you agree to the platform terms.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
