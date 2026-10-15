import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from '../../../components/common/Modal';
import Loader from '../../../components/common/Loader';
import { useFarms, getApiError } from '../../../context/FarmContext';
import * as farmerService from '../../../services/farmerService';

// Used until the API responds (the server is the source of truth for these lists)
const FALLBACK_OPTIONS = {
  STAGES: ['Land Preparation', 'Sowing', 'Germination', 'Vegetative Growth', 'Flowering', 'Grain / Fruit Filling', 'Maturity', 'Harvested'],
  SEASONS: ['Kharif', 'Rabi', 'Zaid'],
  HEALTH: ['Healthy', 'Under Observation', 'At Risk'],
  YIELD_UNITS: ['kg', 'quintal', 'ton'],
};

const HEALTH_BADGE = { Healthy: 'badge-green', 'Under Observation': 'badge-yellow', 'At Risk': 'badge-red' };
const today = () => new Date().toISOString().slice(0, 10);
const toInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const isBlank = (v) => v === '' || v === null || v === undefined;
const daysUntil = (d) => Math.ceil((new Date(d).getTime() - Date.now()) / 864e5);

// Defined at module level so inputs keep focus while typing
const Field = ({ id, label, required, hint, error, children }) => (
  <div className="form-group">
    <label className="form-label" htmlFor={`crop-${id}`}>{label}{required && <span style={{ color: 'var(--color-error)' }}> *</span>}</label>
    {children}
    {error ? <div className="form-error">{error}</div> : hint ? <div className="form-hint">{hint}</div> : null}
  </div>
);

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0 1rem' };

/* ───────────────────────── Add / Edit form ───────────────────────── */
const CropForm = ({ crop, farms, crops, options, onSubmit, onCancel }) => {
  const isEdit = !!crop;
  const [form, setForm] = useState({
    farm: crop?.farm?._id || farms[0]?._id || '',
    name: crop?.name || '',
    variety: crop?.variety || '',
    season: crop?.season || options.SEASONS[0],
    area: crop?.area ?? '',
    sowingDate: toInput(crop?.sowingDate),
    expectedHarvestDate: toInput(crop?.expectedHarvestDate),
    currentStage: crop?.currentStage || options.STAGES[0],
    health: crop?.health || 'Healthy',
    irrigationCycle: crop?.irrigationCycle || '',
    notes: crop?.notes || '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const farm = farms.find((f) => f._id === form.farm);
  // cultivated area still free on the chosen farm (growing crops only, excluding the one being edited)
  const free = useMemo(() => {
    if (!farm) return null;
    const used = crops
      .filter((c) => c.farm._id === farm._id && c.currentStage !== 'Harvested' && c._id !== crop?._id)
      .reduce((s, c) => s + c.area, 0);
    return Math.max(0, +(farm.cultivatedArea - used).toFixed(2));
  }, [farm, crops, crop]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
    setServerError('');
  };

  const validate = () => {
    const e = {};
    if (!form.farm) e.farm = 'Select a farm.';
    if (form.name.trim().length < 2) e.name = 'Enter the crop name.';
    const area = Number(form.area);
    if (isBlank(form.area) || !(area > 0)) e.area = 'Enter an area greater than 0.';
    else if (free !== null && form.currentStage !== 'Harvested' && area > free) e.area = `Only ${free} ${farm.areaUnit} is free on this farm.`;
    if (!form.sowingDate) e.sowingDate = 'Pick the sowing date.';
    if (!form.expectedHarvestDate) e.expectedHarvestDate = 'Pick the expected harvest date.';
    else if (form.sowingDate && form.expectedHarvestDate <= form.sowingDate) e.expectedHarvestDate = 'Must be after the sowing date.';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) { setServerError('Please fix the highlighted fields.'); return; }
    setSaving(true);
    setServerError('');
    const payload = {
      farm: form.farm, name: form.name.trim(), variety: form.variety.trim(), season: form.season,
      area: Number(form.area), sowingDate: form.sowingDate, expectedHarvestDate: form.expectedHarvestDate,
      health: form.health, irrigationCycle: form.irrigationCycle.trim(), notes: form.notes.trim(),
    };
    if (!isEdit) payload.currentStage = form.currentStage; // stage changes later go through "Update stage"
    try {
      await onSubmit(payload);
    } catch (err) {
      setServerError(getApiError(err, 'Could not save the crop.'));
      setSaving(false);
    }
  };

  const cls = (k, base) => `${base}${errors[k] ? ' error' : ''}`;

  return (
    <form onSubmit={submit} noValidate>
      {serverError && <div className="alert alert-error" role="alert" style={{ marginBottom: '1rem' }}>{serverError}</div>}
      <div style={grid}>
        <Field id="farm" label="Farm" required error={errors.farm}>
          <select id="crop-farm" className={cls('farm', 'form-select')} value={form.farm} onChange={set('farm')}>
            {farms.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
          </select>
        </Field>
        <Field id="name" label="Crop name" required error={errors.name}>
          <input id="crop-name" className={cls('name', 'form-input')} value={form.name} onChange={set('name')} maxLength={80} placeholder="e.g. Wheat" />
        </Field>
        <Field id="variety" label="Variety">
          <input id="crop-variety" className="form-input" value={form.variety} onChange={set('variety')} maxLength={80} placeholder="e.g. HD-3086" />
        </Field>
        <Field id="season" label="Season" required>
          <select id="crop-season" className="form-select" value={form.season} onChange={set('season')}>
            {options.SEASONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field id="area" label={`Area under crop${farm ? ` (${farm.areaUnit})` : ''}`} required error={errors.area}
          hint={free !== null && !errors.area ? `${free} ${farm.areaUnit} free on this farm` : undefined}>
          <input id="crop-area" type="number" min="0" step="any" className={cls('area', 'form-input')} value={form.area} onChange={set('area')} />
        </Field>
        {!isEdit && (
          <Field id="currentStage" label="Current stage" hint="Pick where the crop is today">
            <select id="crop-currentStage" className="form-select" value={form.currentStage} onChange={set('currentStage')}>
              {options.STAGES.filter((s) => s !== 'Harvested').map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        )}
        <Field id="sowingDate" label="Sowing date" required error={errors.sowingDate}>
          <input id="crop-sowingDate" type="date" className={cls('sowingDate', 'form-input')} value={form.sowingDate} onChange={set('sowingDate')} />
        </Field>
        <Field id="expectedHarvestDate" label="Expected harvest" required error={errors.expectedHarvestDate}>
          <input id="crop-expectedHarvestDate" type="date" className={cls('expectedHarvestDate', 'form-input')} value={form.expectedHarvestDate} onChange={set('expectedHarvestDate')} />
        </Field>
        <Field id="health" label="Crop health">
          <select id="crop-health" className="form-select" value={form.health} onChange={set('health')}>
            {options.HEALTH.map((h) => <option key={h}>{h}</option>)}
          </select>
        </Field>
        <Field id="irrigationCycle" label="Irrigation schedule">
          <input id="crop-irrigationCycle" className="form-input" value={form.irrigationCycle} onChange={set('irrigationCycle')} maxLength={120} placeholder="e.g. Every 14 days" />
        </Field>
      </div>
      <Field id="notes" label="Notes">
        <textarea id="crop-notes" className="form-textarea" rows={2} value={form.notes} onChange={set('notes')} maxLength={1000} />
      </Field>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }} disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Crop'}
        </button>
      </div>
    </form>
  );
};

/* ───────────────────────── Update lifecycle stage ───────────────────────── */
const StageForm = ({ crop, options, onSubmit, onCancel }) => {
  const later = options.STAGES.slice(options.STAGES.indexOf(crop.currentStage) + 1);
  const [stage, setStage] = useState(later[0]);
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState(options.YIELD_UNITS[1] || options.YIELD_UNITS[0]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!date || date > today()) { setError('Pick a date that is not in the future.'); return; }
    if (stage === 'Harvested' && !isBlank(qty) && !(Number(qty) >= 0)) { setError('Yield must be 0 or more.'); return; }
    setSaving(true); setError('');
    const payload = { stage, date, notes: notes.trim() };
    if (stage === 'Harvested' && !isBlank(qty)) payload.yield = { quantity: Number(qty), unit };
    try { await onSubmit(payload); } catch (err) { setError(getApiError(err, 'Could not update the stage.')); setSaving(false); }
  };

  return (
    <form onSubmit={submit} noValidate>
      {error && <div className="alert alert-error" role="alert" style={{ marginBottom: '1rem' }}>{error}</div>}
      <p style={{ margin: '0 0 1rem', fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
        <strong>{crop.name}</strong> is currently at <strong>{crop.currentStage}</strong>. A crop can only move forward.
      </p>
      <Field id="stage" label="Move to stage" required>
        <select id="crop-stage" className="form-select" value={stage} onChange={(e) => setStage(e.target.value)}>
          {later.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field id="stageDate" label="Date reached" required>
        <input id="crop-stageDate" type="date" className="form-input" max={today()} value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      {stage === 'Harvested' && (
        <Field id="yield" label="Total yield (optional)">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input id="crop-yield" type="number" min="0" step="any" className="form-input" value={qty} onChange={(e) => setQty(e.target.value)} />
            <select className="form-select" style={{ maxWidth: 120 }} value={unit} onChange={(e) => setUnit(e.target.value)} aria-label="Yield unit">
              {options.YIELD_UNITS.map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
        </Field>
      )}
      <Field id="stageNotes" label="Notes">
        <textarea id="crop-stageNotes" className="form-textarea" rows={2} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }} disabled={saving}>{saving ? 'Saving…' : 'Update Stage'}</button>
      </div>
    </form>
  );
};

/* ───────────────────────── Crop card ───────────────────────── */
const CropCard = ({ crop, stages, onEdit, onStage, onDelete }) => {
  const idx = stages.indexOf(crop.currentStage);
  const harvested = crop.currentStage === 'Harvested';
  const left = daysUntil(crop.expectedHarvestDate);
  const overdue = !harvested && left < 0;

  return (
    <div className="card" style={{ background: '#fff', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }} data-testid="crop-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>🌾 {crop.name}</h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            {crop.variety || 'Variety not set'} · {crop.season} · {crop.farm.name}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {overdue && <span className="badge badge-red">Overdue</span>}
          <span className={`badge ${HEALTH_BADGE[crop.health] || 'badge-gray'}`}>{crop.health}</span>
        </div>
      </div>

      {/* lifecycle progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: 6 }}>
          <span>{crop.currentStage}</span><span>{crop.progress}%</span>
        </div>
        <div style={{ height: 8, background: 'var(--color-bg)', borderRadius: 99, overflow: 'hidden' }} role="progressbar" aria-valuenow={crop.progress} aria-valuemin={0} aria-valuemax={100}>
          <div style={{ width: `${crop.progress}%`, height: '100%', background: harvested ? 'var(--color-accent)' : 'var(--color-primary)', transition: 'width .3s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }} aria-label="Lifecycle stages">
          {stages.map((s, i) => (
            <span key={s} title={s} style={{
              width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
              background: i <= idx ? 'var(--color-primary)' : 'var(--color-border)',
              outline: i === idx ? '3px solid var(--color-primary-muted)' : 'none',
            }} />
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem' }}>
        <div><div style={{ color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>Area</div>{crop.area} {crop.farm.areaUnit}</div>
        <div><div style={{ color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>Sown</div>{fmtDate(crop.sowingDate)}</div>
        <div>
          <div style={{ color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>{harvested ? 'Harvested' : 'Expected harvest'}</div>
          {fmtDate(harvested ? crop.actualHarvestDate : crop.expectedHarvestDate)}
          {!harvested && <span style={{ color: overdue ? 'var(--color-error)' : 'var(--color-text-muted)' }}> ({overdue ? `${-left}d late` : `${left}d left`})</span>}
        </div>
        <div><div style={{ color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>{harvested ? 'Yield' : 'Irrigation'}</div>
          {harvested ? (crop.yield?.quantity != null ? `${crop.yield.quantity} ${crop.yield.unit}` : 'Not recorded') : (crop.irrigationCycle || '—')}</div>
      </div>

      {crop.notes && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', background: 'var(--color-bg)', padding: '0.5rem 0.7rem', borderRadius: 'var(--radius-md)' }}>{crop.notes}</div>}

      <details style={{ fontSize: '0.8rem' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--color-primary)' }}>Lifecycle history ({crop.stageHistory.length})</summary>
        <ol style={{ margin: '0.5rem 0 0', paddingLeft: '1.1rem', color: 'var(--color-text-secondary)' }}>
          {crop.stageHistory.map((h, i) => (
            <li key={i}><strong>{h.stage}</strong> — {fmtDate(h.date)}{h.notes ? ` · ${h.notes}` : ''}</li>
          ))}
        </ol>
      </details>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
        {!harvested && <button className="btn btn-primary btn-sm" onClick={() => onStage(crop)}>➡️ Update stage</button>}
        <button className="btn btn-secondary btn-sm" onClick={() => onEdit(crop)}>✏️ Edit</button>
        <button className="btn btn-outline btn-sm" onClick={() => onDelete(crop)}>🗑️ Delete</button>
      </div>
    </div>
  );
};

/* ───────────────────────── Page ───────────────────────── */
const Crops = () => {
  const { farms } = useFarms();
  const [crops, setCrops] = useState([]);
  const [options, setOptions] = useState(FALLBACK_OPTIONS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');

  const [filters, setFilters] = useState({ farm: 'all', season: 'All', status: 'all', q: '' });
  const [modal, setModal] = useState(null); // { type: 'form' | 'stage' | 'delete', crop? }
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setLoadError('');
    try {
      const res = await farmerService.getCrops();
      setCrops(res.data.data.crops);
      if (res.data.data.options) setOptions(res.data.data.options);
    } catch (err) {
      setLoadError(getApiError(err, 'Failed to load your crops.'));
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const flash = (m) => { setNotice(m); setTimeout(() => setNotice(''), 3500); };
  const replace = (c) => setCrops((prev) => prev.map((x) => (x._id === c._id ? c : x)));

  const handleSave = async (payload) => {
    if (modal.crop) {
      const res = await farmerService.updateCrop(modal.crop._id, payload);
      replace(res.data.data.crop);
      flash('Crop updated successfully.');
    } else {
      const res = await farmerService.createCrop(payload);
      setCrops((prev) => [res.data.data.crop, ...prev]);
      flash(`${res.data.data.crop.name} added.`);
    }
    setModal(null);
  };

  const handleStage = async (payload) => {
    const res = await farmerService.updateCropStage(modal.crop._id, payload);
    replace(res.data.data.crop);
    flash(`${res.data.data.crop.name} moved to ${res.data.data.crop.currentStage}.`);
    setModal(null);
  };

  const handleDelete = async () => {
    setDeleting(true); setDeleteError('');
    try {
      await farmerService.deleteCrop(modal.crop._id);
      setCrops((prev) => prev.filter((c) => c._id !== modal.crop._id));
      flash(`${modal.crop.name} deleted.`);
      setModal(null);
    } catch (err) { setDeleteError(getApiError(err, 'Could not delete the crop.')); }
    finally { setDeleting(false); }
  };

  const visible = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return crops.filter((c) =>
      (filters.farm === 'all' || c.farm._id === filters.farm) &&
      (filters.season === 'All' || c.season === filters.season) &&
      (filters.status === 'all' || (filters.status === 'harvested') === (c.currentStage === 'Harvested')) &&
      (!q || `${c.name} ${c.variety}`.toLowerCase().includes(q))
    );
  }, [crops, filters]);

  const stats = useMemo(() => ({
    total: crops.length,
    growing: crops.filter((c) => c.currentStage !== 'Harvested').length,
    ready: crops.filter((c) => c.currentStage === 'Maturity').length,
    harvested: crops.filter((c) => c.currentStage === 'Harvested').length,
  }), [crops]);

  const setF = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));
  const tile = (title, value, color) => (
    <div className="card" style={{ background: '#fff', padding: '0.9rem 1.1rem' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{title}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 900, color }}>{value}</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.25rem' }}>🌾 Crop Lifecycle Management</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Track every crop from land preparation to harvest, farm by farm.
          </p>
        </div>
        <button className="btn btn-primary" style={{ fontWeight: 700 }} onClick={() => setModal({ type: 'form' })}>➕ Add Crop</button>
      </div>

      {notice && <div className="alert alert-success" role="status" style={{ marginBottom: '1rem' }}>✓ {notice}</div>}
      {loadError && (
        <div className="alert alert-error" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <span>{loadError}</span><button className="btn btn-sm btn-secondary" onClick={load}>Retry</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {tile('Total crops', stats.total, 'var(--color-primary)')}
        {tile('Growing', stats.growing, 'var(--color-primary)')}
        {tile('Ready to harvest', stats.ready, '#B7791F')}
        {tile('Harvested', stats.harvested, 'var(--color-text-secondary)')}
      </div>

      <div className="card" style={{ background: '#fff', padding: '0.9rem 1.1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-input" style={{ flex: '1 1 180px', maxWidth: 280 }} placeholder="Search crop or variety…" value={filters.q} onChange={setF('q')} aria-label="Search crops" />
        <select className="form-select" style={{ width: 'auto' }} value={filters.farm} onChange={setF('farm')} aria-label="Filter by farm">
          <option value="all">All farms</option>
          {farms.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={filters.season} onChange={setF('season')} aria-label="Filter by season">
          <option value="All">All seasons</option>
          {options.SEASONS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={filters.status} onChange={setF('status')} aria-label="Filter by status">
          <option value="all">All crops</option>
          <option value="growing">Growing</option>
          <option value="harvested">Harvested</option>
        </select>
      </div>

      {loading ? (
        <Loader text="Loading crops…" />
      ) : crops.length === 0 && !loadError ? (
        <div className="card" style={{ background: '#fff', padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.2rem' }}>🌱</div>
          <h3 style={{ margin: '0.5rem 0' }}>No crops yet</h3>
          <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 1rem' }}>Add your first crop to start tracking its lifecycle.</p>
          <button className="btn btn-primary" onClick={() => setModal({ type: 'form' })}>➕ Add Crop</button>
        </div>
      ) : visible.length === 0 ? (
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>No crops match your filters.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1rem' }}>
          {visible.map((c) => (
            <CropCard key={c._id} crop={c} stages={options.STAGES}
              onEdit={(crop) => setModal({ type: 'form', crop })}
              onStage={(crop) => setModal({ type: 'stage', crop })}
              onDelete={(crop) => { setDeleteError(''); setModal({ type: 'delete', crop }); }} />
          ))}
        </div>
      )}

      <Modal isOpen={modal?.type === 'form'} onClose={() => setModal(null)} title={modal?.crop ? `Edit ${modal.crop.name}` : 'Add a crop'} maxWidth="720px">
        {modal?.type === 'form' && <CropForm crop={modal.crop} farms={farms} crops={crops} options={options} onSubmit={handleSave} onCancel={() => setModal(null)} />}
      </Modal>

      <Modal isOpen={modal?.type === 'stage'} onClose={() => setModal(null)} title="Update lifecycle stage" maxWidth="480px">
        {modal?.type === 'stage' && <StageForm crop={modal.crop} options={options} onSubmit={handleStage} onCancel={() => setModal(null)} />}
      </Modal>

      <Modal isOpen={modal?.type === 'delete'} onClose={() => !deleting && setModal(null)} title="Delete this crop?">
        <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', marginTop: 0 }}>
          “{modal?.crop?.name}” and its lifecycle history will be permanently removed.
        </p>
        {deleteError && <div className="alert alert-error" role="alert" style={{ marginBottom: '1rem' }}>{deleteError}</div>}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setModal(null)} disabled={deleting}>Cancel</button>
          <button className="btn btn-primary" style={{ background: 'var(--color-error)', borderColor: 'var(--color-error)' }} onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Yes, delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Crops;