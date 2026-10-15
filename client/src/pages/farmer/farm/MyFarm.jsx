import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useFarms, getApiError } from '../../../context/FarmContext';
import FarmForm from '../../../components/farmer/FarmForm';
import Modal from '../../../components/common/Modal';

const fmt = (n) => (n === null || n === undefined ? '—' : Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 }));
const fmtDate = (d) => (d && !Number.isNaN(new Date(d).getTime()) ? new Date(d).toLocaleDateString() : '—');
const label = { fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' };
const tile = { background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)' };

const Stat = ({ title, value, sub }) => (
  <div style={tile}>
    <div style={label}>{title}</div>
    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>{value}</div>
    {sub && <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{sub}</div>}
  </div>
);

const MyFarm = () => {
  const { user } = useAuth();
  const { farms, options, loading, error, refresh, addFarm, editFarm, removeFarm } = useFarms();

  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState('view'); // 'view' | 'create' | 'edit'
  const [notice, setNotice] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const farm = farms.find((f) => f._id === selectedId) || farms[0];

  // keep selection valid when farms change (e.g. after delete)
  useEffect(() => {
    if (farms.length && !farms.some((f) => f._id === selectedId)) setSelectedId(farms[0]._id);
  }, [farms, selectedId]);

  const flash = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 3500); };

  const handleCreate = async (payload) => {
    const created = await addFarm(payload);
    setSelectedId(created._id);
    setMode('view');
    flash(`“${created.name}” was created.`);
  };

  const handleEdit = async (payload) => {
    await editFarm(farm._id, payload);
    setMode('view');
    flash('Farm details updated successfully.');
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      const name = farm.name;
      await removeFarm(farm._id);
      setConfirmDelete(false);
      flash(`“${name}” was deleted.`);
    } catch (err) {
      setDeleteError(getApiError(err, 'Could not delete the farm.'));
    } finally {
      setDeleting(false);
    }
  };

  const formCard = (title, children) => (
    <div className="card" style={{ background: '#fff', padding: '1.75rem' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 1.25rem', color: 'var(--color-primary)' }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--color-text)' }}>🌱 My Farms</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Manage your land parcels, soil characteristics and irrigation. You can register more than one farm.
          </p>
        </div>
        {mode === 'view' && (
          <button className="btn btn-primary" style={{ fontWeight: 700 }} onClick={() => setMode('create')}>➕ Add New Farm</button>
        )}
      </div>

      {notice && <div className="alert alert-success" role="status" style={{ marginBottom: '1rem' }}>✓ {notice}</div>}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <span>{error}</span><button className="btn btn-sm btn-secondary" onClick={refresh}>Retry</button>
        </div>
      )}

      {mode === 'create' && formCard('Add a new farm',
        <FarmForm options={options} onSubmit={handleCreate} onCancel={() => setMode('view')} submitLabel="Create Farm" />)}

      {mode === 'edit' && farm && formCard(`Edit “${farm.name}”`,
        <FarmForm key={farm._id} farm={farm} options={options} onSubmit={handleEdit} onCancel={() => setMode('view')} submitLabel="Save Changes" />)}

      {mode === 'view' && farm && (
        <>
          {/* Farm switcher */}
          <div role="tablist" aria-label="Your farms" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {farms.map((f) => (
              <button
                key={f._id}
                role="tab"
                aria-selected={f._id === farm._id}
                onClick={() => setSelectedId(f._id)}
                className={`btn btn-sm ${f._id === farm._id ? 'btn-primary' : 'btn-secondary'}`}
              >
                🌾 {f.name}
              </button>
            ))}
          </div>

          <div className="card" style={{ background: '#fff', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>{farm.name}</h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                  📍 {[farm.location.village, farm.location.district, farm.location.state].filter(Boolean).join(', ')}
                  {farm.location.pincode && ` – ${farm.location.pincode}`}
                  {farm.coordinates?.lat != null && (
                    <span style={{ color: 'var(--color-text-muted)' }}> · {farm.coordinates.lat}°, {farm.coordinates.lng}°</span>
                  )}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {farm.organicCertified && <span className="badge badge-green" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>🌿 Certified Organic{farm.certificationId && ` · ${farm.certificationId}`}</span>}
                <button className="btn btn-secondary btn-sm" onClick={() => setMode('edit')}>✏️ Edit</button>
                <button className="btn btn-outline btn-sm" disabled={farms.length <= 1}
                  title={farms.length <= 1 ? 'You must keep at least one farm' : 'Delete this farm'}
                  onClick={() => { setDeleteError(''); setConfirmDelete(true); }}>🗑️ Delete</button>
              </div>
            </div>

            <hr className="divider" style={{ margin: '0 0 1.25rem' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <Stat title="Total land" value={`${fmt(farm.totalArea)} ${farm.areaUnit}`} sub={`Cultivated: ${fmt(farm.cultivatedArea)} ${farm.areaUnit}`} />
              <Stat title="Soil" value={farm.soilType} sub={farm.soilPh != null ? `pH ${fmt(farm.soilPh)}` : 'pH not recorded'} />
              <Stat title="Irrigation" value={farm.irrigationType} sub={`Source: ${farm.waterSource}`} />
              <Stat title="Farmer" value={user?.name || '—'} sub={user?.loginId && `ID: ${user.loginId}`} />
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '1.5rem 0 0.75rem' }}>🌾 Main crops</h3>
            {farm.primaryCrops.length ? (
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {farm.primaryCrops.map((crop) => (
                  <span key={crop} style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary-dark)', fontWeight: 700, fontSize: '0.85rem', padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)' }}>
                    🌱 {crop}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', margin: 0 }}>No crops listed yet — use Edit to add some.</p>
            )}

            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1.5rem' }}>
              Created {fmtDate(farm.createdAt)} · Last updated {fmtDate(farm.updatedAt)}
            </div>
          </div>
        </>
      )}

      {mode === 'view' && !farm && loading && <p>Loading…</p>}

      <Modal isOpen={confirmDelete} onClose={() => !deleting && setConfirmDelete(false)} title="Delete this farm?">
        <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', marginTop: 0 }}>
          “{farm?.name}” will be permanently removed. This cannot be undone.
        </p>
        {deleteError && <div className="alert alert-error" role="alert" style={{ marginBottom: '1rem' }}>{deleteError}</div>}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)} disabled={deleting}>Cancel</button>
          <button className="btn btn-primary" style={{ background: 'var(--color-error)', borderColor: 'var(--color-error)' }} onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Yes, delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MyFarm;