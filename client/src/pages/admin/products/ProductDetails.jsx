import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, hideProduct, restoreProduct } from '../../../services/adminService';
import StatusBadge from '../../../components/admin/StatusBadge';
import ConfirmModal from '../../../components/admin/ConfirmModal';

const Field = ({ label, value }) => (
  <div>
    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.2rem' }}>{label}</p>
    <p style={{ fontWeight: 500, color: 'var(--color-text)', fontSize: '0.875rem', margin: 0 }}>{value || '—'}</p>
  </div>
);

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [modal, setModal] = useState({ open: false, action: '' });
  const [hideReason, setHideReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await getProductById(id);
      setProduct(res.data.data.product);
    } catch { setError('Failed to load product.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (modal.action === 'hide') await hideProduct(id, hideReason || 'Removed by admin.');
      else await restoreProduct(id);
      setSuccessMsg(`Product ${modal.action === 'hide' ? 'hidden' : 'restored'}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setModal({ open: false, action: '' });
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Action failed.');
      setModal({ open: false, action: '' });
    } finally { setActionLoading(false); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</div>;
  if (!product) return <div className="alert alert-error">{error || 'Product not found.'}</div>;

  return (
    <div style={{ maxWidth: 760 }}>
      <button onClick={() => navigate('/admin/products')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.25rem' }}>
        ← Back to Products
      </button>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Header */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0, color: 'var(--color-text)' }}>{product.name}</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>{product.category}</p>
          </div>
          <StatusBadge status={product.status} size="md" />
        </div>

        {/* Images */}
        {product.images?.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {product.images.map((img, i) => (
              <img key={i} src={`http://localhost:5000${img}`} alt={`Product ${i + 1}`} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} onError={(e) => { e.target.style.display = 'none'; }} />
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem', padding: '1rem', background: 'var(--color-off-white)', borderRadius: 'var(--radius-md)' }}>
          <Field label="Price" value={`₹${product.price?.toLocaleString('en-IN')} ${product.priceUnit || ''}`} />
          <Field label="Quantity" value={`${product.quantity} ${product.quantityUnit || ''}`} />
          <Field label="Listed On" value={fmtDate(product.createdAt)} />
          <Field label="Location" value={[product.location?.district, product.location?.state].filter(Boolean).join(', ')} />
        </div>

        {product.description && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Description</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.6 }}>{product.description}</p>
          </div>
        )}
      </div>

      {/* Farmer info */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>🌾 Farmer / Seller</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem' }}>
          <Field label="Name" value={product.farmer?.name} />
          <Field label="Email" value={product.farmer?.email} />
          <Field label="Mobile" value={product.farmer?.mobile} />
          <Field label="Login ID" value={product.farmer?.loginId} />
        </div>
        <button onClick={() => navigate(`/admin/users/${product.farmer?._id}`)} className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>View Farmer Profile →</button>
      </div>

      {/* Hidden info */}
      {product.status === 'hidden' && (
        <div style={{ background: '#fff3e0', border: '1px solid #ffcc80', borderRadius: 'var(--radius-xl)', padding: '1.25rem', marginBottom: '1.25rem' }}>
          <p style={{ fontWeight: 700, color: '#c0392b', fontSize: '0.875rem', margin: '0 0 0.25rem' }}>⚠️ This product is hidden</p>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>Reason: {product.hiddenReason || 'No reason provided.'}</p>
        </div>
      )}

      {/* Actions */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {product.status !== 'hidden' && (
          <button onClick={() => { setModal({ open: true, action: 'hide' }); setHideReason(''); }} className="btn btn-sm" style={{ background: '#fff3e0', color: '#c0392b', border: '1px solid #ffcc80' }}>
            🚫 Hide Product
          </button>
        )}
        {product.status === 'hidden' && (
          <button onClick={() => setModal({ open: true, action: 'restore' })} className="btn btn-sm" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid #b2dfb2' }}>
            ✅ Restore Product
          </button>
        )}
      </div>

      <ConfirmModal
        isOpen={modal.open}
        title={modal.action === 'hide' ? 'Hide Product' : 'Restore Product'}
        message={modal.action === 'hide' ? `Hide "${product.name}"?` : `Restore "${product.name}" to active listing?`}
        confirmLabel={modal.action === 'hide' ? 'Hide' : 'Restore'}
        danger={modal.action === 'hide'}
        onConfirm={handleAction}
        onCancel={() => setModal({ open: false, action: '' })}
        loading={actionLoading}
      >
        {modal.action === 'hide' && (
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Reason (optional)</label>
            <input className="form-input" placeholder="e.g. Violates listing guidelines" value={hideReason} onChange={(e) => setHideReason(e.target.value)} />
          </div>
        )}
      </ConfirmModal>
    </div>
  );
};

export default ProductDetails;
