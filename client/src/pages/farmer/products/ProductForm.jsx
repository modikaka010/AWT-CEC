/**
 * ProductForm.jsx  –  Farmer: Add / Edit product form
 *
 * Drop-in replacement for the original file.
 * All API calls, service imports, and routing are preserved exactly.
 * Only the UI layer is changed.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, updateProduct, getProductById } from '../../../services/farmerService';

/* ── Constants ─────────────────────────────────────────────────────────── */
const CATEGORIES = [
  'Grains & Cereals', 'Vegetables', 'Fruits', 'Pulses & Legumes',
  'Oilseeds', 'Spices & Herbs', 'Dairy & Livestock', 'Flowers', 'Other',
];
const PRICE_UNITS = ['per kg', 'per quintal', 'per ton', 'per liter', 'per piece', 'per dozen', 'per bundle'];
const QTY_UNITS   = ['kg', 'quintal', 'ton', 'liter', 'piece', 'dozen', 'bundle'];
const ACCENT      = '#1a6b1a';

const defaultForm = {
  name: '', category: '', description: '', price: '', priceUnit: 'per kg',
  quantity: '', quantityUnit: 'kg', images: [], status: 'active',
  location: { state: '', district: '', pincode: '' },
};

/* ── Section wrapper ─────────────────────────────────────────────────── */
const Section = ({ title, icon, subtitle, children }) => (
  <div style={{
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    marginBottom: '1.25rem',
  }}>
    {/* Section header */}
    <div style={{
      padding: '1rem 1.5rem',
      borderBottom: '1px solid var(--color-border-light)',
      background: 'var(--color-primary-subtle)',
      display: 'flex', alignItems: 'center', gap: '0.6rem',
    }}>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      <div>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, color: 'var(--color-text)' }}>{title}</h3>
        {subtitle && <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>{subtitle}</p>}
      </div>
    </div>
    {/* Section body */}
    <div style={{ padding: '1.5rem' }}>{children}</div>
  </div>
);

/* ── Field wrapper ───────────────────────────────────────────────────── */
const Field = ({ label, required, hint, error, children }) => (
  <div className="form-group" style={{ marginBottom: '1rem' }}>
    <label className="form-label">
      {label}
      {required && <span style={{ color: 'var(--color-error)', marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {hint && !error && <p className="form-hint">{hint}</p>}
    {error && <p className="form-error">⚠ {error}</p>}
  </div>
);

/* ── Image preview card ──────────────────────────────────────────────── */
const ImageCard = ({ url, index, onRemove, isPrimary }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div style={{
      position: 'relative', width: 88, height: 88,
      borderRadius: 'var(--radius-md)',
      border: isPrimary
        ? `2px solid ${ACCENT}`
        : '1.5px solid var(--color-border)',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {!failed ? (
        <img
          src={url} alt={`Image ${index + 1}`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: loaded ? 'block' : 'none' }}
        />
      ) : null}
      {(!loaded && !failed) && (
        <div style={{ width: '100%', height: '100%', background: 'var(--color-bg)' }} />
      )}
      {failed && (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-error-bg)', fontSize: '1.3rem' }}>
          🚫
        </div>
      )}
      {/* Primary badge */}
      {isPrimary && (
        <span style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center',
          background: 'rgba(26,107,26,0.85)', color: '#fff', fontSize: '0.55rem', fontWeight: 700,
          padding: '0.1rem', letterSpacing: '0.04em',
        }}>
          PRIMARY
        </span>
      )}
      
      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        style={{
          position: 'absolute', top: 4, right: 4,
          width: 20, height: 20, borderRadius: '50%',
          background: 'rgba(217,56,41,0.9)', color: '#fff',
          border: 'none', cursor: 'pointer', fontSize: '0.7rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1, fontWeight: 700,
        }}
        title="Remove image"
      >
        ×
      </button>
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────────────────── */
const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    getProductById(id)
      .then((res) => {
        const p = res.data.data.product;
        setForm({
          name: p.name || '',
          category: p.category || '',
          description: p.description || '',
          price: p.price ?? '',
          priceUnit: p.priceUnit || 'per kg',
          quantity: p.quantity ?? '',
          quantityUnit: p.quantityUnit || 'kg',
          images: p.images || [],
          status: p.status === 'hidden' ? 'active' : (p.status || 'active'),
          location: { state: p.location?.state || '', district: p.location?.district || '', pincode: p.location?.pincode || '' },
        });
      })
      .catch(() => setError('Failed to load product. Please go back and try again.'))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const key = name.split('.')[1];
      setForm((f) => ({ ...f, location: { ...f.location, [key]: value } }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
    // Clear field error on change
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
  };

  const addImage = () => {
    const url = imageInput.trim();
    if (!url) return;
    if (form.images.length >= 5) { setError('You can add a maximum of 5 images.'); return; }
    setForm((f) => ({ ...f, images: [...f.images, url] }));
    setImageInput('');
  };

  const removeImage = (i) => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Product name is required.';
    if (!form.category) errs.category = 'Please select a category.';
    if (form.price === '' || isNaN(form.price) || parseFloat(form.price) < 0) errs.price = 'Enter a valid price (0 or higher).';
    if (form.quantity === '' || isNaN(form.quantity) || parseInt(form.quantity) < 0) errs.quantity = 'Enter a valid quantity (0 or higher).';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setFieldErrors({});
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }

    const payload = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) };
    setLoading(true);
    try {
      if (isEdit) await updateProduct(id, payload);
      else await createProduct(payload);
      navigate('/farmer/products');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}>⏳</span>
        Loading product details…
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 740 }}>
      {/* Page title + back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => navigate('/farmer/products')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: 1 }}
          title="Back to products"
        >
          ←
        </button>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.3rem', margin: 0 }}>
            {isEdit ? 'Edit product' : 'Add new product'}
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0.15rem 0 0' }}>
            {isEdit ? 'Update the details below and save.' : 'Fill in the details to list your product on the marketplace.'}
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} noValidate>

        {/* ── Basic Info ──────────────────────────────────────────────── */}
        <Section title="Basic information" icon="📋" subtitle="Name, category, description, and visibility">
          <Field label="Product name" required error={fieldErrors.name}>
            <input
              className={`form-input${fieldErrors.name ? ' error' : ''}`}
              name="name" value={form.name}
              onChange={handleChange}
              placeholder="e.g. Organic Basmati Rice, Fresh Alphonso Mangoes"
              maxLength={120}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Category" required error={fieldErrors.category}>
              <select
                className={`form-input${fieldErrors.category ? ' error' : ''}`}
                name="category" value={form.category} onChange={handleChange}
              >
                <option value="">Select a category…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Listing status" hint="Active products appear in the marketplace immediately.">
              <select className="form-input" name="status" value={form.status} onChange={handleChange}>
                <option value="active">Active — visible to buyers</option>
                <option value="draft">Draft — hidden from marketplace</option>
              </select>
            </Field>
          </div>

          <Field label="Description" hint="Describe quality, harvest date, packaging, certifications, etc.">
            <textarea
              className="form-input"
              name="description" rows={4}
              value={form.description} onChange={handleChange}
              placeholder="e.g. Hand-picked from our farm in Nashik, stored in cool conditions, available in gunny bags of 50 kg."
              style={{ resize: 'vertical', minHeight: 90 }}
            />
          </Field>
        </Section>

        {/* ── Pricing & Stock ─────────────────────────────────────────── */}
        <Section title="Pricing & stock" icon="💰" subtitle="Set your price and available quantity">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr', gap: '1rem' }}>
            <Field label="Price (₹)" required error={fieldErrors.price}>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)',
                  fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.9rem',
                }}>₹</span>
                <input
                  className={`form-input${fieldErrors.price ? ' error' : ''}`}
                  style={{ paddingLeft: '1.75rem' }}
                  type="number" name="price" step="0.01" min="0"
                  value={form.price} onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </Field>
            <Field label="Per unit">
              <select className="form-input" name="priceUnit" value={form.priceUnit} onChange={handleChange}>
                {PRICE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Quantity available" required error={fieldErrors.quantity}>
              <input
                className={`form-input${fieldErrors.quantity ? ' error' : ''}`}
                type="number" name="quantity" min="0" step="1"
                value={form.quantity} onChange={handleChange}
                placeholder="0"
              />
            </Field>
            <Field label="Unit">
              <select className="form-input" name="quantityUnit" value={form.quantityUnit} onChange={handleChange}>
                {QTY_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
          </div>

          {/* Live price preview */}
          {form.price && form.quantity && (
            <div style={{
              marginTop: '0.25rem', padding: '0.875rem 1.1rem',
              background: 'var(--color-primary-subtle)', borderRadius: 'var(--radius-md)',
              display: 'flex', gap: '2rem', flexWrap: 'wrap',
            }}>
              <div>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', margin: '0 0 0.15rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Listing price</p>
                <p style={{ fontWeight: 800, fontSize: '1.1rem', color: ACCENT, margin: 0 }}>
                  ₹{parseFloat(form.price).toLocaleString('en-IN')} {form.priceUnit}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', margin: '0 0 0.15rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total stock value</p>
                <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)', margin: 0 }}>
                  ₹{(parseFloat(form.price) * parseInt(form.quantity || 0)).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', margin: '0 0 0.15rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Availability</p>
                <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)', margin: 0 }}>
                  {parseInt(form.quantity)} {form.quantityUnit}
                </p>
              </div>
            </div>
          )}
        </Section>

        {/* ── Images ──────────────────────────────────────────────────── */}
        <Section title="Product images" icon="🖼️" subtitle="Up to 5 publicly accessible image URLs. The first image is used as the cover.">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              className="form-input"
              style={{ flex: 1 }}
              placeholder="Paste an image URL (e.g. from Cloudinary, ImgBB, Imgur)…"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
            />
            <button
              type="button"
              onClick={addImage}
              className="btn btn-sm"
              style={{ background: ACCENT, color: '#fff', borderColor: ACCENT, whiteSpace: 'nowrap' }}
              disabled={!imageInput.trim() || form.images.length >= 5}
            >
              Add image
            </button>
          </div>

          {form.images.length > 0 ? (
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              {form.images.map((url, i) => (
                <ImageCard key={i} url={url} index={i} onRemove={removeImage} isPrimary={i === 0} />
              ))}
              {form.images.length < 5 && (
                <div style={{
                  width: 88, height: 88, borderRadius: 'var(--radius-md)',
                  border: '2px dashed var(--color-border-strong)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-text-muted)', fontSize: '0.65rem', gap: 4, cursor: 'default',
                }}>
                  <span style={{ fontSize: '1.2rem' }}>+</span>
                  {5 - form.images.length} more
                </div>
              )}
            </div>
          ) : (
            <div style={{
              padding: '1.5rem', textAlign: 'center', borderRadius: 'var(--radius-md)',
              border: '2px dashed var(--color-border-strong)', color: 'var(--color-text-muted)',
              fontSize: '0.8rem',
            }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.4rem' }}>📷</span>
              No images added yet. Listings with photos get significantly more buyer interest.
            </div>
          )}

          <p style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '0.625rem' }}>
            Tip: Upload your images to a free host like{' '}
            <a href="https://imgbb.com" target="_blank" rel="noreferrer" style={{ color: ACCENT }}>ImgBB</a>{' '}
            or <a href="https://cloudinary.com" target="_blank" rel="noreferrer" style={{ color: ACCENT }}>Cloudinary</a>,
            then paste the direct link here.
          </p>
        </Section>

        {/* ── Location ────────────────────────────────────────────────── */}
        <Section title="Location" icon="📍" subtitle="Help buyers know where your produce comes from (optional)">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px', gap: '1rem' }}>
            <Field label="State">
              <input className="form-input" name="location.state" value={form.location.state} onChange={handleChange} placeholder="e.g. Maharashtra" />
            </Field>
            <Field label="District">
              <input className="form-input" name="location.district" value={form.location.district} onChange={handleChange} placeholder="e.g. Nashik" />
            </Field>
            <Field label="Pincode">
              <input className="form-input" name="location.pincode" value={form.location.pincode} onChange={handleChange} placeholder="422001" maxLength={6} />
            </Field>
          </div>
        </Section>

        {/* ── Submit bar ──────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: '0.75rem', alignItems: 'center',
          padding: '1.25rem 1.5rem',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          position: 'sticky', bottom: '1rem',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <button
            type="submit"
            disabled={loading}
            className="btn"
            style={{ background: ACCENT, color: '#fff', borderColor: ACCENT, padding: '0.7rem 1.75rem', fontWeight: 700 }}
          >
            {loading ? '⏳ Saving…' : isEdit ? '✅ Save changes' : '➕ List product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/farmer/products')}
            className="btn btn-secondary"
            style={{ padding: '0.7rem 1.25rem' }}
          >
            Cancel
          </button>
          {isEdit && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
              Changes go live immediately for active listings.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProductForm;