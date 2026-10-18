import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { submitCropAdvice, getCropAdviceById, updateCropAdvice, getMyFarmers } from '../../../services/expertService';

const INITIAL = {
  farmerId: '', cropName: '', growthStage: '', soilInfo: '', weatherConditions: '',
  observedProblem: '', recommendedActions: '', irrigationAdvice: '',
  nutrientAdvice: '', pestPrecautions: '', harvestAdvice: '', additionalNotes: '',
};

const TextArea = ({ label, name, value, onChange, placeholder, rows = 3, required }) => (
  <div className="form-group">
    <label className="form-label">
      {label}{required && <span style={{ color: 'var(--color-error)' }}> *</span>}
    </label>
    <textarea className="form-input" name={name} rows={rows} value={value} onChange={onChange}
      placeholder={placeholder} style={{ resize: 'vertical' }} />
  </div>
);

const CropAdviceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(INITIAL);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load farmers for the select dropdown
  useEffect(() => {
    getMyFarmers({ limit: 100 })
      .then((res) => setFarmers(res.data.data.farmers || []))
      .catch(() => {});
  }, []);

  // Load existing advice if editing
  useEffect(() => {
    if (!isEdit) return;
    getCropAdviceById(id)
      .then((res) => {
        const a = res.data.data.advice;
        setForm({
          farmerId: a.farmer?._id || '',
          cropName: a.cropName || '',
          growthStage: a.growthStage || '',
          soilInfo: a.soilInfo || '',
          weatherConditions: a.weatherConditions || '',
          observedProblem: a.observedProblem || '',
          recommendedActions: a.recommendedActions || '',
          irrigationAdvice: a.irrigationAdvice || '',
          nutrientAdvice: a.nutrientAdvice || '',
          pestPrecautions: a.pestPrecautions || '',
          harvestAdvice: a.harvestAdvice || '',
          additionalNotes: a.additionalNotes || '',
        });
      })
      .catch(() => setError('Failed to load advice.'))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cropName.trim() || !form.recommendedActions.trim()) {
      setError('Crop name and recommended actions are required.');
      return;
    }
    if (!isEdit && !form.farmerId) {
      setError('Please select a farmer.');
      return;
    }
    setLoading(true); setError('');
    try {
      if (isEdit) {
        await updateCropAdvice(id, form);
        setSuccessMsg('Crop advice updated successfully.');
      } else {
        await submitCropAdvice(form);
        setSuccessMsg('Crop advice submitted successfully!');
        setForm(INITIAL);
      }
      setTimeout(() => { setSuccessMsg(''); navigate('/expert/crop-advice'); }, 1500);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save crop advice.');
    } finally { setLoading(false); }
  };

  if (fetching) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 720 }}>
      <button onClick={() => navigate('/expert/crop-advice')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1565c0', fontWeight: 600, fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.25rem' }}>
        ← Back to Crop Advice
      </button>

      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.75rem' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.2rem', margin: '0 0 1.5rem', color: 'var(--color-text)' }}>
          {isEdit ? '✏️ Edit Crop Advice' : '🌱 New Crop Advice'}
        </h2>

        {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Farmer — only shown when creating */}
          {!isEdit && (
            <div className="form-group">
              <label className="form-label">Farmer <span style={{ color: 'var(--color-error)' }}>*</span></label>
              {farmers.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>No farmers connected yet. Accept a consultation first.</p>
              ) : (
                <select className="form-input" name="farmerId" value={form.farmerId} onChange={handleChange}>
                  <option value="">— Select Farmer —</option>
                  {farmers.map((f) => (
                    <option key={f._id} value={f._id}>{f.name} ({f.loginId})</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Two-col grid for context fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Crop Name <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <input className="form-input" name="cropName" value={form.cropName} onChange={handleChange} placeholder="e.g. Wheat, Cotton, Rice" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Growth Stage</label>
              <input className="form-input" name="growthStage" value={form.growthStage} onChange={handleChange} placeholder="e.g. Germination, Vegetative" />
            </div>
          </div>

          <TextArea label="Observed Problem" name="observedProblem" value={form.observedProblem} onChange={handleChange} placeholder="What issue did you observe or what did the farmer report?" rows={3} />
          <TextArea label="Recommended Actions" name="recommendedActions" value={form.recommendedActions} onChange={handleChange} placeholder="Specific steps the farmer should take…" rows={5} required />
          <TextArea label="Irrigation Advice" name="irrigationAdvice" value={form.irrigationAdvice} onChange={handleChange} placeholder="Watering schedule, frequency, method…" />
          <TextArea label="Nutrient / Fertilizer Advice" name="nutrientAdvice" value={form.nutrientAdvice} onChange={handleChange} placeholder="Fertilizer type, quantity, schedule…" />
          <TextArea label="Pest / Disease Precautions" name="pestPrecautions" value={form.pestPrecautions} onChange={handleChange} placeholder="Preventive measures, safe pesticide use…" />
          <TextArea label="Harvest Advice" name="harvestAdvice" value={form.harvestAdvice} onChange={handleChange} placeholder="Optimal harvest time, indicators, post-harvest…" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Soil Information</label>
              <input className="form-input" name="soilInfo" value={form.soilInfo} onChange={handleChange} placeholder="Soil type, pH, composition" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Weather Conditions</label>
              <input className="form-input" name="weatherConditions" value={form.weatherConditions} onChange={handleChange} placeholder="Current / expected weather" />
            </div>
          </div>

          <TextArea label="Additional Notes" name="additionalNotes" value={form.additionalNotes} onChange={handleChange} placeholder="Any other important information…" rows={3} />

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: 160, background: '#1565c0', borderColor: '#1565c0' }}>
              {loading ? 'Saving…' : isEdit ? 'Update Advice' : 'Submit Advice'}
            </button>
            <button type="button" onClick={() => navigate('/expert/crop-advice')} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CropAdviceForm;
