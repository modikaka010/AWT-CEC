import React, { useCallback, useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';
import { createConsultation, getConsultation, getConsultations } from '../../../services/farmerService';
import { assetUrl } from '../../../utils/assetUrl';

const INITIAL_FORM = {
  cropName: '',
  problemTitle: '',
  description: '',
  symptoms: '',
  category: 'other',
  cropStage: '',
  priority: 'medium',
};

const STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  completed: 'Responded',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

const STATUS_BADGES = {
  pending: 'badge-yellow',
  accepted: 'badge-blue',
  completed: 'badge-green',
  rejected: 'badge-red',
  cancelled: 'badge-yellow',
};

const PRIORITIES = ['low', 'medium', 'high'];
const CATEGORIES = ['disease', 'pest', 'soil', 'nutrient', 'irrigation', 'weather', 'other'];
const CROP_STAGES = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting / Grain filling', 'Harvest', 'Post-harvest'];

const formatDate = (date) => date
  ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

const FarmerConsultation = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const loadConsultations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getConsultations({ status: 'all', limit: 50 });
      setConsultations(res.data.data.consultations || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load consultation requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConsultations();
  }, [loadConsultations]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateRequest = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      images.forEach((image) => data.append('images', image));

      const response = await createConsultation(data);
      setSuccess(response.data.message || 'Your consultation request was submitted.');
      setForm(INITIAL_FORM);
      setImages([]);
      setModalOpen(false);
      await loadConsultations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit your consultation request.');
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = async (consultation) => {
    setViewDetail(consultation);
    setDetailLoading(true);
    setError('');
    try {
      const response = await getConsultation(consultation._id);
      setViewDetail(response.data.data.consultation);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load consultation details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeForm = () => {
    if (submitting) return;
    setModalOpen(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--color-text)' }}>
            🔬 Expert Agronomist Consultations
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Submit a crop problem to the expert panel and view your expert's response here.
          </p>
        </div>
        <button onClick={() => { setError(''); setSuccess(''); setModalOpen(true); }} className="btn btn-primary" style={{ fontWeight: 800 }}>
          ➕ Request New Consultation
        </button>
      </div>

      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}
      {error && !viewDetail && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading consultation requests…</div>
      ) : consultations.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>📭</p>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>You have not submitted any consultation requests yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {consultations.map((item) => (
            <article key={item._id} className="card" style={{ background: '#fff', padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  Submitted {formatDate(item.createdAt)}
                </span>
                <span className={`badge ${STATUS_BADGES[item.status] || 'badge-blue'}`}>
                  {STATUS_LABELS[item.status] || item.status}
                </span>
              </div>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--color-text)' }}>
                  🌾 {item.cropName}
                </h2>
                <p style={{ fontWeight: 700, margin: 0 }}>{item.problemTitle}</p>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {item.description}
              </p>
              {item.symptoms && (
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  <strong>Symptoms:</strong> {item.symptoms}
                </p>
              )}
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                Priority: <strong style={{ textTransform: 'capitalize' }}>{item.priority}</strong>
                {item.expert?.name && <> · Expert: <strong>{item.expert.name}</strong></>}
              </div>
              {item.status === 'rejected' && item.rejectionReason && (
                <div className="alert alert-error" style={{ margin: 0, fontSize: '0.82rem' }}>
                  <strong>Reason:</strong> {item.rejectionReason}
                </div>
              )}
              {item.expertResponse?.advice && (
                <div style={{ background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                  <strong style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--color-success)' }}>Expert response</strong>
                  <span style={{ fontSize: '0.84rem' }}>{item.expertResponse.advice}</span>
                </div>
              )}
              <button onClick={() => openDetail(item)} className="btn btn-secondary btn-full btn-sm" style={{ marginTop: 'auto', fontWeight: 700 }}>
                View Request Details
              </button>
            </article>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={closeForm} title="Submit Crop Consultation Request">
        <form onSubmit={handleCreateRequest}>
          <div className="form-group">
            <label className="form-label" htmlFor="consultation-crop">Affected Crop *</label>
            <input id="consultation-crop" name="cropName" type="text" className="form-input" maxLength={150} required value={form.cropName} onChange={handleFormChange} placeholder="e.g. Wheat, Rice, Mustard" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="consultation-title">Problem Title *</label>
            <input id="consultation-title" name="problemTitle" type="text" className="form-input" minLength={5} maxLength={300} required value={form.problemTitle} onChange={handleFormChange} placeholder="Briefly summarize the issue" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="consultation-description">Problem Description *</label>
            <textarea id="consultation-description" name="description" rows={4} className="form-textarea" minLength={20} maxLength={3000} required value={form.description} onChange={handleFormChange} placeholder="Describe the crop problem in at least 20 characters…" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="consultation-symptoms">Observed Symptoms</label>
            <textarea id="consultation-symptoms" name="symptoms" rows={3} className="form-textarea" maxLength={2000} value={form.symptoms} onChange={handleFormChange} placeholder="Describe visible symptoms, pests, or changes…" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="consultation-category">Category</label>
              <select id="consultation-category" name="category" className="form-select" value={form.category} onChange={handleFormChange}>
                {CATEGORIES.map((category) => <option key={category} value={category}>{category[0].toUpperCase() + category.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="consultation-priority">Priority</label>
              <select id="consultation-priority" name="priority" className="form-select" value={form.priority} onChange={handleFormChange}>
                {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority[0].toUpperCase() + priority.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="consultation-stage">Crop Stage</label>
              <select id="consultation-stage" name="cropStage" className="form-select" value={form.cropStage} onChange={handleFormChange}>
                <option value="">Select stage</option>
                {CROP_STAGES.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="consultation-images">Crop Photos (optional, up to 4)</label>
            <input id="consultation-images" type="file" className="form-input" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setImages(Array.from(event.target.files || []).slice(0, 4))} />
            <span className="form-hint">JPG, PNG, or WEBP; maximum 5 MB each.</span>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={closeForm} className="btn btn-secondary" disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit for Expert Triage →'}
            </button>
          </div>
        </form>
      </Modal>

      {viewDetail && (
        <Modal isOpen={!!viewDetail} onClose={() => setViewDetail(null)} title="Consultation Request Details">
          {detailLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading request details…</div>
          ) : (
            <div>
              {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>🌾 {viewDetail.cropName}</h3>
                <span className={`badge ${STATUS_BADGES[viewDetail.status] || 'badge-blue'}`}>{STATUS_LABELS[viewDetail.status] || viewDetail.status}</span>
              </div>
              <p style={{ fontWeight: 700 }}>{viewDetail.problemTitle}</p>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}><strong>Description:</strong> {viewDetail.description}</p>
              {viewDetail.symptoms && <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}><strong>Symptoms:</strong> {viewDetail.symptoms}</p>}
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Submitted {formatDate(viewDetail.createdAt)} · Priority: {viewDetail.priority}
                {viewDetail.expert?.name && <> · Expert: {viewDetail.expert.name}</>}
              </p>
              {viewDetail.images?.length > 0 && (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '1rem 0' }}>
                  {viewDetail.images.map((image, index) => (
                    <a key={image} href={assetUrl(image)} target="_blank" rel="noopener noreferrer">
                      <img src={assetUrl(image)} alt={`Crop problem ${index + 1}`} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                    </a>
                  ))}
                </div>
              )}
              {viewDetail.expertResponse?.advice ? (
                <section style={{ background: 'var(--color-primary-subtle)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginTop: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.75rem', color: 'var(--color-primary)' }}>Expert Opinion</h4>
                  {viewDetail.expertResponse.diagnosis && <p><strong>Diagnosis / Assessment:</strong> {viewDetail.expertResponse.diagnosis}</p>}
                  <p><strong>Advice:</strong> {viewDetail.expertResponse.advice}</p>
                  {viewDetail.expertResponse.recommendedActions && <p><strong>Recommended Actions:</strong> {viewDetail.expertResponse.recommendedActions}</p>}
                  {viewDetail.expertResponse.precautions && <p><strong>Precautions:</strong> {viewDetail.expertResponse.precautions}</p>}
                  {viewDetail.expertResponse.followUp && <p><strong>Follow-up:</strong> {viewDetail.expertResponse.followUp}</p>}
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 0 }}>Responded {formatDate(viewDetail.expertResponse.respondedAt)}</p>
                </section>
              ) : viewDetail.status === 'rejected' ? (
                <div className="alert alert-error">{viewDetail.rejectionReason || 'The expert could not accept this request.'}</div>
              ) : (
                <div className="alert alert-info">
                  {viewDetail.status === 'accepted'
                    ? 'An expert has accepted your request and is preparing a response.'
                    : 'Your request is waiting for an expert to review it.'}
                </div>
              )}
              <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
                <button onClick={() => setViewDetail(null)} className="btn btn-primary btn-sm">Close</button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default FarmerConsultation;
