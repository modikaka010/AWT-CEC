import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFarmerById, addToCart } from '../../../services/buyerService';

const FarmerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartMsg, setCartMsg] = useState('');

  useEffect(() => {
    getFarmerById(id)
      .then((res) => setData(res.data.data))
      .catch((e) => setError(e.response?.data?.message || 'Farmer not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async (productId, productName) => {
    try {
      await addToCart(productId, 1);
      setCartMsg(`"${productName}" added to cart!`);
      setTimeout(() => setCartMsg(''), 3000);
    } catch (e) {
      setCartMsg(e.response?.data?.message || 'Failed to add to cart.');
      setTimeout(() => setCartMsg(''), 3000);
    }
  };

  if (loading) return <div style={{ padding:'2rem', textAlign:'center', color:'var(--color-text-muted)' }}>Loading…</div>;
  if (!data) return <div className="alert alert-error">{error || 'Farmer not found.'}</div>;

  const { farmer, products } = data;

  return (
    <div style={{ maxWidth:780 }}>
      <button onClick={() => navigate('/buyer/farmers')} style={{ display:'flex', alignItems:'center', gap:'0.4rem', color:'#c4840e', fontWeight:600, fontSize:'0.85rem', background:'none', border:'none', cursor:'pointer', marginBottom:'1.25rem' }}>
        ← Back to Farmers
      </button>

      {cartMsg && (
        <div className={`alert ${cartMsg.includes('Failed') ? 'alert-error' : 'alert-success'}`} style={{ marginBottom:'1rem' }}>{cartMsg}</div>
      )}

      {/* Farmer header */}
      <div style={{ background:'linear-gradient(135deg, #134f13 0%, #1a6b1a 100%)', borderRadius:'var(--radius-xl)', padding:'1.5rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'1.25rem', color:'#fff', flexWrap:'wrap' }}>
        <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1.5rem', flexShrink:0 }}>
          {farmer.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex:1 }}>
          <h2 style={{ fontWeight:800, fontSize:'1.25rem', margin:0 }}>{farmer.name}</h2>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.8rem', margin:'0.2rem 0 0' }}>{farmer.loginId}</p>
        </div>
        <button onClick={() => navigate(`/buyer/chat/${farmer._id}`)} className="btn btn-sm" style={{ background:'rgba(255,255,255,0.2)', color:'#fff', border:'1px solid rgba(255,255,255,0.3)' }}>
          💬 Chat with Farmer
        </button>
      </div>

      {/* Products */}
      <h3 style={{ fontWeight:700, fontSize:'1rem', margin:'0 0 1rem' }}>
        🌾 Products ({products.length})
      </h3>
      {products.length === 0 ? (
        <div style={{ textAlign:'center', padding:'2rem', background:'#fff', borderRadius:'var(--radius-lg)', border:'1px solid var(--color-border)' }}>
          <p style={{ color:'var(--color-text-muted)' }}>No active products from this farmer.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'1rem' }}>
          {products.map((p) => (
            <div key={p._id} style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', overflow:'hidden' }}>
              <div style={{ height:130, background:'var(--color-off-white)', cursor:'pointer' }} onClick={() => navigate(`/buyer/marketplace/${p._id}`)}>
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={(e) => { e.target.style.display='none'; }} />
                ) : (
                  <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem' }}>🌾</div>
                )}
              </div>
              <div style={{ padding:'0.75rem' }}>
                <p style={{ fontWeight:700, fontSize:'0.85rem', margin:'0 0 0.2rem', cursor:'pointer' }} onClick={() => navigate(`/buyer/marketplace/${p._id}`)}>{p.name}</p>
                <p style={{ fontWeight:800, fontSize:'1rem', color:'#c4840e', margin:'0 0 0.5rem' }}>₹{p.price?.toLocaleString('en-IN')} {p.priceUnit}</p>
                <p style={{ fontSize:'0.72rem', color:'var(--color-text-muted)', margin:'0 0 0.5rem' }}>Stock: {p.quantity} {p.quantityUnit}</p>
                <div style={{ display:'flex', gap:'0.4rem' }}>
                  <button onClick={() => navigate(`/buyer/marketplace/${p._id}`)} className="btn btn-secondary btn-sm" style={{ flex:1 }}>View</button>
                  <button onClick={() => handleAddToCart(p._id, p.name)} className="btn btn-sm" style={{ flex:1, background:'#c4840e', color:'#fff', borderColor:'#c4840e' }}>+Cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerProfile;
