import React, { useState } from 'react';
import { getApiError } from '../../context/FarmContext';

const toForm = (farm) => ({
  name: farm?.name || '',
  village: farm?.location?.village || '',
  district: farm?.location?.district || '',
  state: farm?.location?.state || '',
  pincode: farm?.location?.pincode || '',
  lat: farm?.coordinates?.lat ?? '',
  lng: farm?.coordinates?.lng ?? '',
  areaUnit: farm?.areaUnit || 'acres',
  totalArea: farm?.totalArea ?? '',
  cultivatedArea: farm?.cultivatedArea ?? '',
  soilType: farm?.soilType || '',
  soilPh: farm?.soilPh ?? '',
  irrigationType: farm?.irrigationType || '',
  waterSource: farm?.waterSource || '',
  primaryCrops: (farm?.primaryCrops || []).join(', '),
  organicCertified: !!farm?.organicCertified,
  certificationId: farm?.certificationId || '',
});

const isBlank = (v) => v === '' || v === null || v === undefined;

/** Client-side mirror of the server rules → { field: message } */
const validate = (f) => {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Enter a farm name (at least 2 characters).';
  if (!f.district.trim()) e.district = 'District is required.';
  if (!f.state.trim()) e.state = 'State is required.';
  if (f.pincode && !/^\d{6}$/.test(f.pincode)) e.pincode = 'Pincode must be 6 digits.';
  const total = Number(f.totalArea), cult = Number(f.cultivatedArea);
  if (isBlank(f.totalArea) || !(total > 0)) e.totalArea = 'Enter a total area greater than 0.';
  if (isBlank(f.cultivatedArea) || !(cult >= 0)) e.cultivatedArea = 'Enter the cultivated area (0 or more).';
  else if (!e.totalArea && cult > total) e.cultivatedArea = 'Cannot exceed the total area.';
  if (!f.soilType) e.soilType = 'Select a soil type.';
  if (!isBlank(f.soilPh) && !(Number(f.soilPh) >= 0 && Number(f.soilPh) <= 14)) e.soilPh = 'pH must be between 0 and 14.';
  if (!f.irrigationType) e.irrigationType = 'Select an irrigation type.';
  if (!f.waterSource) e.waterSource = 'Select a water source.';
  if (isBlank(f.lat) !== isBlank(f.lng)) e.lat = 'Enter both latitude and longitude, or leave both empty.';
  else if (!isBlank(f.lat)) {
    if (!(Math.abs(Number(f.lat)) <= 90)) e.lat = 'Latitude must be between -90 and 90.';
    else if (!(Math.abs(Number(f.lng)) <= 180)) e.lat = 'Longitude must be between -180 and 180.';
  }
  if (f.organicCertified && !f.certificationId.trim()) e.certificationId = 'Certification ID is required for organic farms.';
  return e;
};

const toPayload = (f) => ({
  name: f.name.trim(),
  location: { village: f.village.trim(), district: f.district.trim(), state: f.state.trim(), pincode: f.pincode.trim() },
  coordinates: { lat: isBlank(f.lat) ? null : Number(f.lat), lng: isBlank(f.lng) ? null : Number(f.lng) },
  areaUnit: f.areaUnit,
  totalArea: Number(f.totalArea),
  cultivatedArea: Number(f.cultivatedArea),
  soilType: f.soilType,
  soilPh: isBlank(f.soilPh) ? null : Number(f.soilPh),
  irrigationType: f.irrigationType,
  waterSource: f.waterSource,
  primaryCrops: f.primaryCrops.split(',').map((c) => c.trim()).filter(Boolean),
  organicCertified: f.organicCertified,
  certificationId: f.organicCertified ? f.certificationId.trim() : '',
});

// Defined at module level so React doesn't remount inputs (and drop focus) on every keystroke
const Field = ({ id, label, required, hint, error, children }) => (
  <div className="form-group">
    <label className="form-label" htmlFor={`farm-${id}`}>{label}{required && <span style={{ color: 'var(--color-error)' }}> *</span>}</label>
    {children}
    {error ? <div className="form-error">{error}</div> : hint ? <div className="form-hint">{hint}</div> : null}
  </div>
);

/**
 * Shared create / edit form.
 *   farm      – existing farm (edit) or undefined (create)
 *   options   – dropdown values from the API
 *   onSubmit  – async (payload) => void; throw to show an error
 *   onCancel  – optional; omit to hide the Cancel button (first-farm onboarding)
 */
const FarmForm = ({ farm, options, onSubmit, onCancel, submitLabel = 'Save Farm' }) => {
  const [form, setForm] = useState(() => toForm(farm));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      setServerError('Please fix the highlighted fields.');
      return;
    }
    setSaving(true);
    setServerError('');
    try {
      await onSubmit(toPayload(form));
    } catch (err) {
      setServerError(getApiError(err, 'Could not save the farm.'));
      setSaving(false);
    }
  };

  const input = (id, props = {}) => (
    <input id={`farm-${id}`} className={`form-input${errors[id] ? ' error' : ''}`} value={form[id]} onChange={set(id)} {...props} />
  );
  const select = (id, values, placeholder) => (
    <select id={`farm-${id}`} className={`form-select${errors[id] ? ' error' : ''}`} value={form[id]} onChange={set(id)}>
      {placeholder && <option value="">{placeholder}</option>}
      {values.map((v) => <option key={v} value={v}>{v}</option>)}
    </select>
  );

  const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0 1.25rem' };
  const sectionTitle = { fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)', margin: '1.25rem 0 0.75rem' };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && <div className="alert alert-error" role="alert" style={{ marginBottom: '1rem' }}>{serverError}</div>}

      <div style={{ ...sectionTitle, marginTop: 0 }}>Basic details</div>
      <div style={grid}>
        <Field id="name" error={errors.name} label="Farm name" required>{input('name', { placeholder: 'e.g. Green Valley Farm', maxLength: 100 })}</Field>
        <Field id="village" error={errors.village} label="Village / Town">{input('village', { maxLength: 100 })}</Field>
        <Field id="district" error={errors.district} label="District" required>{input('district', { maxLength: 100 })}</Field>
        <Field id="state" error={errors.state} label="State" required>{input('state', { maxLength: 100 })}</Field>
        <Field id="pincode" error={errors.pincode} label="Pincode">{input('pincode', { inputMode: 'numeric', maxLength: 6, placeholder: '6 digits' })}</Field>
        <Field id="lat" error={errors.lat} label="GPS coordinates (optional)" hint="Latitude, longitude in decimal degrees">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input id="farm-lat" className={`form-input${errors.lat ? ' error' : ''}`} value={form.lat} onChange={set('lat')} placeholder="Lat e.g. 30.901" inputMode="decimal" aria-label="Latitude" />
            <input id="farm-lng" className={`form-input${errors.lat ? ' error' : ''}`} value={form.lng} onChange={set('lng')} placeholder="Lng e.g. 75.857" inputMode="decimal" aria-label="Longitude" />
          </div>
        </Field>
      </div>

      <div style={sectionTitle}>Land</div>
      <div style={grid}>
        <Field id="areaUnit" error={errors.areaUnit} label="Area unit">{select('areaUnit', options.AREA_UNITS)}</Field>
        <Field id="totalArea" error={errors.totalArea} label="Total land area" required>{input('totalArea', { type: 'number', min: 0, step: 'any' })}</Field>
        <Field id="cultivatedArea" error={errors.cultivatedArea} label="Cultivated area" required>{input('cultivatedArea', { type: 'number', min: 0, step: 'any' })}</Field>
        <Field id="soilType" error={errors.soilType} label="Soil type" required>{select('soilType', options.SOIL_TYPES, 'Select…')}</Field>
        <Field id="soilPh" error={errors.soilPh} label="Soil pH">{input('soilPh', { type: 'number', min: 0, max: 14, step: 'any', placeholder: '0 – 14' })}</Field>
      </div>

      <div style={sectionTitle}>Water & crops</div>
      <div style={grid}>
        <Field id="irrigationType" error={errors.irrigationType} label="Irrigation system" required>{select('irrigationType', options.IRRIGATION_TYPES, 'Select…')}</Field>
        <Field id="waterSource" error={errors.waterSource} label="Water source" required>{select('waterSource', options.WATER_SOURCES, 'Select…')}</Field>
        <Field id="primaryCrops" error={errors.primaryCrops} label="Main crops" hint="Separate with commas, e.g. Wheat, Basmati Rice">{input('primaryCrops')}</Field>
      </div>

      <div style={sectionTitle}>Certification</div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
        <input type="checkbox" checked={form.organicCertified} onChange={set('organicCertified')} /> This farm is organic certified
      </label>
      {form.organicCertified && (
        <div style={grid}>
          <Field id="certificationId" error={errors.certificationId} label="Certification ID" required>{input('certificationId', { maxLength: 60 })}</Field>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>}
        <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }} disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default FarmForm;