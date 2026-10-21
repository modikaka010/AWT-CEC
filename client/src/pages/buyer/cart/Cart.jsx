import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../../../services/buyerService';
import ConfirmModal from '../../../components/admin/ConfirmModal';

const Cart = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [clearModal, setClearModal] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await getCart();
      const d = res.data.data;
      setItems(d.items || []);
      setGrandTotal(d.grandTotal || 0);
    } catch { setError('Failed to load cart.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleQtyChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      await updateCartItem(itemId, newQty);
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update quantity.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRemove = async (itemId) => {
    setRemoving(itemId);
    try {
      await removeFromCart(itemId);
      load();
    } catch { setError('Failed to remove item.'); }
    finally { setRemoving(null); }
  };

  const handleClearCart = async () => {
    setActionLoading(true);
    try {
      await clearCart();
      setItems([]); setGrandTotal(0);
      setClearModal(false);
      setSuccessMsg('Cart cleared.');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch { setError('Failed to clear cart.'); setClearModal(false); }
    finally { setActionLoading(false); }
  };

  const fmtCurrency = (n) => `₹${n?.toLocaleString('en-IN') || '0'}`;

  // Group items by farmer for display
  const grouped = items.reduce((acc, item) => {
    const fid = String(item.farmer?._id || item.farmer);
    if (!acc[fid]) acc[fid] = { farmer: item.farmer, items: [] };
    acc[fid].items.push(item);
    return acc;
  }, {});

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading cart…</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🗂️</span>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>My Cart</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {items.length > 0 && (
          <button onClick={() => setClearModal(true)} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
            🗑️ Clear Cart
          </button>
        )}
      </div>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🗂️</p>
          <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.375rem' }}>Your cart is empty.</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>Browse the marketplace to add products.</p>
          <button onClick={() => navigate('/buyer/marketplace')} className="btn btn-sm" style={{ background: '#c4840e', color: '#fff', borderColor: '#c4840e' }}>
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Cart items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {Object.values(grouped).map(({ farmer, items: farmerItems }) => (
              <div key={String(farmer?._id || farmer)} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                {/* Farmer header */}
                <div style={{ padding: '0.75rem 1.25rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1rem' }}>👨‍🌾</span>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)' }}>
                    {farmer?.name || 'Farmer'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{farmer?.loginId || ''}</span>
                </div>

                {/* Items */}
                {farmerItems.map((item) => (
                  <div key={item._id} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Product image */}
                    <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', background: 'var(--color-off-white)', overflow: 'hidden', flexShrink: 0 }}>
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🌾</div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.875rem', margin: '0 0 0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.productName}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#c4840e', fontWeight: 700, margin: 0 }}>
                        {fmtCurrency(item.priceAtAdd)} {item.priceUnit}
                      </p>
                      {!item.available && (
                        <p style={{ fontSize: '0.72rem', color: 'var(--color-error)', margin: '0.2rem 0 0', fontWeight: 600 }}>
                          ⚠️ Product unavailable or quantity changed
                        </p>
                      )}
                    </div>

                    {/* Qty controls */}
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <button onClick={() => handleQtyChange(item._id, item.quantity - 1)} disabled={item.quantity <= 1} style={{ padding: '0.3rem 0.625rem', background: 'var(--color-off-white)', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 700 }}>−</button>
                      <span style={{ padding: '0.3rem 0.75rem', fontWeight: 700, fontSize: '0.875rem', minWidth: 36, textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => handleQtyChange(item._id, item.quantity + 1)} style={{ padding: '0.3rem 0.625rem', background: 'var(--color-off-white)', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 700 }}>+</button>
                    </div>

                    {/* Subtotal */}
                    <p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-text)', minWidth: 80, textAlign: 'right', margin: 0 }}>
                      {fmtCurrency(item.subtotal)}
                    </p>

                    {/* Remove */}
                    <button onClick={() => handleRemove(item._id)} disabled={removing === item._id} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', fontSize: '1.1rem', padding: '0.25rem' }} aria-label="Remove">
                      {removing === item._id ? '…' : '🗑️'}
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', position: 'sticky', top: '1rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 1rem' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Subtotal ({items.length} items)</span>
                <span style={{ fontWeight: 600 }}>{fmtCurrency(grandTotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Delivery</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>COD</span>
              </div>
              <hr style={{ border: 'none', borderTop: '2px solid var(--color-border)', margin: '0.5rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem' }}>Total</span>
                <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#c4840e' }}>{fmtCurrency(grandTotal)}</span>
              </div>
            </div>

            {items.some((i) => !i.available) && (
              <div className="alert alert-warning" style={{ marginBottom: '1rem', fontSize: '0.78rem' }}>
                ⚠️ Some items are no longer available. Please remove them before checkout.
              </div>
            )}

            <button
              onClick={() => navigate('/buyer/checkout')}
              disabled={items.some((i) => !i.available)}
              className="btn btn-full"
              style={{ background: '#c4840e', color: '#fff', borderColor: '#c4840e', fontSize: '0.95rem', fontWeight: 700, padding: '0.75rem' }}
            >
              Proceed to Checkout →
            </button>
            <button onClick={() => navigate('/buyer/marketplace')} className="btn btn-secondary btn-full btn-sm" style={{ marginTop: '0.5rem' }}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={clearModal}
        title="Clear Cart"
        message="Remove all items from your cart?"
        confirmLabel="Clear Cart"
        danger
        onConfirm={handleClearCart}
        onCancel={() => setClearModal(false)}
        loading={actionLoading}
      />
    </div>
  );
};

export default Cart;
