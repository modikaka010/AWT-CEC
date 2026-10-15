import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, deleteProduct } from '../../../services/farmerService';
import StatusBadge from '../../../components/admin/StatusBadge';
import ConfirmModal from '../../../components/admin/ConfirmModal';

const ACCENT = '#1a6b1a';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [archiveModal, setArchiveModal] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    getProductById(id)
      .then((res) => {
        setProduct(res.data.data.product);
        setStats(res.data.data.stats || {});
      })
      .catch((e) => setError(e.response?.data?.message || 'Product not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleArchive = async () => {
    setArchiving(true);
    try {
      await deleteProduct(id);
      navigate('/farmer/products');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to archive.');
      setArchiveModal(false);
    } finally { setArchiving(false); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' }) : '—';

  if (loading) return <div style={{ padding:'2rem', textAlign:'center', color:'var(--color-text-muted)' }}>Loading…</div>;
  if (!product) return <div className="alert alert-error">{error || 'Product not found.'}</div>;

  return (
    <div style={{ maxWidth:760 }}>
      
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'1.25rem' }}>
        {/* Images */}
        <div>
          <div style={{ height:260, background:'var(--color-off-white)', borderRadius:'var(--radius-xl)', overflow:'hidden', marginBottom:'0.625rem', border:'1px solid var(--color-border)' }}>
            {product.images?.[activeImg] ? (
              <img src={product.images[activeImg]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={(e) => { e.target.style.display='none'; }} />
            ) : (
              <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'4rem' }}>🌾</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div style={{ display:'flex', gap:'0.5rem' }}>
              {product.images.map((img, i) => (
                <div key={i} onClick={() => setActiveImg(i)} style={{ width:52, height:52, borderRadius:'var(--radius-md)', overflow:'hidden', cursor:'pointer', border:`2px solid ${activeImg===i ? ACCENT : 'var(--color-border)'}` }}>
                  <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem', marginBottom:'0.75rem' }}>
            <div>
              <span style={{ fontSize:'0.7rem', fontWeight:700, background:'#edf7ed', color:ACCENT, borderRadius:'9999px', padding:'0.2rem 0.6rem' }}>{product.category}</span>
              <h2 style={{ fontWeight:800, fontSize:'1.25rem', margin:'0.5rem 0 0.25rem' }}>{product.name}</h2>
              <p style={{ fontSize:'0.78rem', color:'var(--color-text-muted)', margin:0 }}>Listed on {fmtDate(product.createdAt)}</p>
            </div>
            <StatusBadge status={product.status} />
          </div>

          <div style={{ display:'flex', alignItems:'baseline', gap:'0.5rem', marginBottom:'0.5rem' }}>
            <span style={{ fontSize:'1.75rem', fontWeight:900, color:ACCENT }}>₹{product.price?.toLocaleString('en-IN')}</span>
            <span style={{ fontSize:'0.875rem', color:'var(--color-text-muted)' }}>{product.priceUnit}</span>
          </div>
          <p style={{ fontSize:'0.82rem', margin:'0 0 1rem', color:'var(--color-text-secondary)' }}>
            Qty: <strong>{product.quantity} {product.quantityUnit}</strong>
            {product.location?.district && ` · ${product.location.district}, ${product.location.state}`}
          </p>

          {product.description && (
            <p style={{ fontSize:'0.875rem', color:'var(--color-text)', lineHeight:1.7, background:'var(--color-off-white)', padding:'0.75rem 1rem', borderRadius:'var(--radius-md)', margin:'0 0 1rem' }}>
              {product.description}
            </p>
          )}

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.625rem', marginBottom:'1rem' }}>
            <div style={{ background:'#edf7ed', borderRadius:'var(--radius-md)', padding:'0.625rem 0.875rem', textAlign:'center' }}>
              <p style={{ fontWeight:800, fontSize:'1.25rem', color:ACCENT, margin:0 }}>{stats.totalOrders || 0}</p>
              <p style={{ fontSize:'0.7rem', color:'var(--color-text-muted)', margin:0 }}>Total Orders</p>
            </div>
            <div style={{ background:'#edf7ed', borderRadius:'var(--radius-md)', padding:'0.625rem 0.875rem', textAlign:'center' }}>
              <p style={{ fontWeight:800, fontSize:'1.25rem', color:ACCENT, margin:0 }}>₹{(stats.revenue || 0).toLocaleString('en-IN')}</p>
              <p style={{ fontSize:'0.7rem', color:'var(--color-text-muted)', margin:0 }}>Revenue</p>
            </div>
          </div>

          <div style={{ display:'flex', gap:'0.625rem' }}>
            <button onClick={() => navigate(`/farmer/products/${id}/edit`)} className="btn btn-sm" style={{ flex:1, background:ACCENT, color:'#fff', borderColor:ACCENT }}>✏️ Edit</button>
            <button onClick={() => setArchiveModal(true)} className="btn btn-sm" style={{ flex:1, background:'var(--color-error-bg)', color:'var(--color-error)', border:'1px solid #f5c6c3' }}>🗑️ Archive</button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={archiveModal}
        title="Archive Product"
        message={`Archive "${product.name}"? It will be hidden from the marketplace.`}
        confirmLabel="Archive"
        danger
        onConfirm={handleArchive}
        onCancel={() => setArchiveModal(false)}
        loading={archiving}
      />
    </div>
  );
};

export default ProductDetail;
