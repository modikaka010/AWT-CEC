import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, addToCart, createNegotiation } from '../../../services/buyerService';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [cartMsg, setCartMsg] = useState('');
  const [cartLoading, setCartLoading] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [showNegotiateForm, setShowNegotiateForm] = useState(false);
  const [negotiateData, setNegotiateData] = useState({ offerPrice:'', quantity:1, message:'' });
  const [negError, setNegError] = useState('');
  const [negSuccess, setNegSuccess] = useState('');
  const [negLoading, setNegLoading] = useState(false);

  useEffect(() => {
    getProductById(id)
      .then((res) => setProduct(res.data.data.product))
      .catch((e) => setError(e.response?.data?.message || 'Product not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    setCartLoading(true); setCartMsg('');
    try {
      await addToCart(id, qty);
      setCartMsg(`Added ${qty} ${product.quantityUnit} to cart!`);
      setTimeout(() => setCartMsg(''), 3000);
    } catch (e) {
      setCartMsg(e.response?.data?.message || 'Failed to add to cart.');
      setTimeout(() => setCartMsg(''), 3000);
    } finally { setCartLoading(false); }
  };

  const handleBuyNow = async () => {
    setCartLoading(true);
    try {
      await addToCart(id, qty);
      navigate('/buyer/cart');
    } catch (e) {
      setCartMsg(e.response?.data?.message || 'Failed.');
    } finally { setCartLoading(false); }
  };

  const handleNegotiate = async (e) => {
    e.preventDefault();
    setNegError(''); setNegSuccess('');
    if (!negotiateData.offerPrice || parseFloat(negotiateData.offerPrice) <= 0) {
      setNegError('Please enter a valid offer price.'); return;
    }
    setNegLoading(true);
    try {
      const res = await createNegotiation({
        productId: id,
        quantity: parseInt(negotiateData.quantity) || qty,
        offerPrice: parseFloat(negotiateData.offerPrice),
        message: negotiateData.message,
      });
      setNegSuccess('Negotiation started! The farmer will respond soon.');
      setShowNegotiateForm(false);
      setTimeout(() => setNegSuccess(''), 4000);
    } catch (e) {
      setNegError(e.response?.data?.message || 'Failed to start negotiation.');
    } finally { setNegLoading(false); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';

  if (loading) return <div style={{ padding:'2rem', textAlign:'center', color:'var(--color-text-muted)' }}>Loading…</div>;
  if (!product) return <div className="alert alert-error">{error || 'Product not found.'}</div>;

  const totalPrice = (qty * product.price).toLocaleString('en-IN');

  return (
    <div style={{ maxWidth:820 }}>
      <button onClick={() => navigate('/buyer/marketplace')} style={{ display:'flex', alignItems:'center', gap:'0.4rem', color:'#c4840e', fontWeight:600, fontSize:'0.85rem', background:'none', border:'none', cursor:'pointer', marginBottom:'1.25rem' }}>
        ← Back to Marketplace
      </button>

      {cartMsg && (
        <div className={`alert ${cartMsg.includes('Failed') ? 'alert-error' : 'alert-success'}`} style={{ marginBottom:'1rem' }}>{cartMsg}</div>
      )}
      {negSuccess && <div className="alert alert-success" style={{ marginBottom:'1rem' }}>{negSuccess}</div>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        {/* Images */}
        <div>
          <div style={{ height:280, background:'var(--color-off-white)', borderRadius:'var(--radius-xl)', overflow:'hidden', marginBottom:'0.75rem', border:'1px solid var(--color-border)' }}>
            {product.images?.[activeImg] ? (
              <img src={product.images[activeImg]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                onError={(e) => { e.target.style.display='none'; }} />
            ) : (
              <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'4rem' }}>🌾</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div style={{ display:'flex', gap:'0.5rem' }}>
              {product.images.map((img, i) => (
                <div key={i} onClick={() => setActiveImg(i)} style={{ width:60, height:60, borderRadius:'var(--radius-md)', overflow:'hidden', cursor:'pointer', border:`2px solid ${activeImg === i ? '#c4840e' : 'var(--color-border)'}` }}>
                  <img src={img} alt={`img${i}`} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    onError={(e) => { e.target.style.display='none'; }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <span style={{ fontSize:'0.72rem', fontWeight:700, background:'#fef3dc', color:'#c4840e', borderRadius:'9999px', padding:'0.2rem 0.6rem' }}>{product.category}</span>
          <h2 style={{ fontWeight:800, fontSize:'1.375rem', margin:'0.5rem 0 0.25rem', color:'var(--color-text)' }}>{product.name}</h2>
          <p style={{ fontSize:'0.82rem', color:'var(--color-text-muted)', margin:'0 0 0.875rem' }}>
            Listed on {fmtDate(product.createdAt)}
          </p>

          <div style={{ display:'flex', alignItems:'baseline', gap:'0.5rem', marginBottom:'0.5rem' }}>
            <span style={{ fontSize:'1.75rem', fontWeight:900, color:'#c4840e' }}>₹{product.price?.toLocaleString('en-IN')}</span>
            <span style={{ fontSize:'0.875rem', color:'var(--color-text-muted)' }}>{product.priceUnit}</span>
          </div>
          <p style={{ fontSize:'0.82rem', color:'var(--color-text-secondary)', margin:'0 0 1rem' }}>
            Available: <strong>{product.quantity} {product.quantityUnit}</strong>
          </p>

          {product.description && (
            <p style={{ fontSize:'0.875rem', color:'var(--color-text)', lineHeight:1.7, margin:'0 0 1rem', background:'var(--color-off-white)', padding:'0.75rem 1rem', borderRadius:'var(--radius-md)' }}>
              {product.description}
            </p>
          )}

          {/* Quantity selector */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1rem' }}>
            <label style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--color-text)' }}>Quantity:</label>
            <div style={{ display:'flex', alignItems:'center', border:'1px solid var(--color-border)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ padding:'0.4rem 0.75rem', background:'var(--color-off-white)', border:'none', cursor:'pointer', fontSize:'1rem', fontWeight:700 }}>−</button>
              <span style={{ padding:'0.4rem 0.875rem', fontWeight:700, fontSize:'0.9rem', minWidth:40, textAlign:'center' }}>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.quantity, q + 1))} style={{ padding:'0.4rem 0.75rem', background:'var(--color-off-white)', border:'none', cursor:'pointer', fontSize:'1rem', fontWeight:700 }}>+</button>
            </div>
            <span style={{ fontSize:'0.8rem', color:'var(--color-text-muted)' }}>{product.quantityUnit}</span>
          </div>

          <div style={{ background:'var(--color-off-white)', borderRadius:'var(--radius-md)', padding:'0.625rem 0.875rem', marginBottom:'1rem', fontSize:'0.875rem' }}>
            Total: <strong style={{ color:'#c4840e' }}>₹{totalPrice}</strong> for {qty} {product.quantityUnit}
          </div>

          <div style={{ display:'flex', gap:'0.625rem', flexWrap:'wrap' }}>
            <button onClick={handleAddToCart} disabled={cartLoading} className="btn btn-sm" style={{ flex:1, minWidth:120, background:'#c4840e', color:'#fff', borderColor:'#c4840e' }}>
              {cartLoading ? '…' : '🗂️ Add to Cart'}
            </button>
            <button onClick={handleBuyNow} disabled={cartLoading} className="btn btn-primary btn-sm" style={{ flex:1, minWidth:120 }}>
              ⚡ Buy Now
            </button>
            <button onClick={() => { setShowNegotiateForm((s) => !s); setNegotiateData((d) => ({ ...d, offerPrice:'', quantity:qty })); }} className="btn btn-secondary btn-sm" style={{ flex:1, minWidth:120 }}>
              🤝 Negotiate
            </button>
          </div>
        </div>
      </div>

      {/* Negotiate form */}
      {showNegotiateForm && (
        <div style={{ background:'#fff', border:'2px solid #c4840e', borderRadius:'var(--radius-xl)', padding:'1.5rem', marginTop:'1.25rem' }}>
          <h3 style={{ fontWeight:700, fontSize:'1rem', color:'#c4840e', margin:'0 0 1rem' }}>🤝 Start Negotiation</h3>
          <p style={{ fontSize:'0.8rem', color:'var(--color-text-muted)', margin:'0 0 1rem' }}>
            Listed price: <strong>₹{product.price?.toLocaleString('en-IN')} {product.priceUnit}</strong>
          </p>
          {negError && <div className="alert alert-error" style={{ marginBottom:'0.875rem' }}>{negError}</div>}
          <form onSubmit={handleNegotiate}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Your Offer Price (₹) *</label>
                <input className="form-input" type="number" step="0.01" min="1" placeholder={`e.g. ${Math.round(product.price * 0.9)}`}
                  value={negotiateData.offerPrice} onChange={(e) => setNegotiateData((d) => ({ ...d, offerPrice:e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Quantity ({product.quantityUnit})</label>
                <input className="form-input" type="number" min="1" max={product.quantity}
                  value={negotiateData.quantity} onChange={(e) => setNegotiateData((d) => ({ ...d, quantity:e.target.value }))} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop:'1rem' }}>
              <label className="form-label">Message (optional)</label>
              <textarea className="form-input" rows={2} placeholder="Explain your offer or requirements…"
                value={negotiateData.message} onChange={(e) => setNegotiateData((d) => ({ ...d, message:e.target.value }))} style={{ resize:'vertical' }} />
            </div>
            <div style={{ display:'flex', gap:'0.625rem' }}>
              <button type="submit" disabled={negLoading} className="btn btn-sm" style={{ background:'#c4840e', color:'#fff', borderColor:'#c4840e', minWidth:130 }}>
                {negLoading ? 'Sending…' : 'Send Offer'}
              </button>
              <button type="button" onClick={() => setShowNegotiateForm(false)} className="btn btn-secondary btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Farmer info */}
      <div style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', padding:'1.5rem', marginTop:'1.25rem' }}>
        <h3 style={{ fontWeight:700, fontSize:'1rem', margin:'0 0 1rem' }}>👨‍🌾 Sold By</h3>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.875rem' }}>
            <div style={{ width:44, height:44, borderRadius:'50%', background:'var(--color-primary-muted)', color:'var(--color-primary)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1.125rem' }}>
              {product.farmer?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p style={{ fontWeight:700, fontSize:'0.9rem', margin:0 }}>{product.farmer?.name}</p>
              <p style={{ fontSize:'0.75rem', color:'var(--color-text-muted)', margin:0 }}>
                {product.farmer?.loginId}
                {product.location?.district ? ` · ${product.location.district}` : ''}
                {product.location?.state ? `, ${product.location.state}` : ''}
              </p>
            </div>
          </div>
          <div style={{ display:'flex', gap:'0.5rem' }}>
            <button onClick={() => navigate(`/buyer/farmers/${product.farmer?._id}`)} className="btn btn-secondary btn-sm">View Profile</button>
            <button onClick={() => navigate(`/buyer/chat/${product.farmer?._id}`)} className="btn btn-sm" style={{ background:'#c4840e', color:'#fff', borderColor:'#c4840e' }}>💬 Chat</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
