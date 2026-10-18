import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFarmerDetails } from '../../../services/expertService';
import StatusBadge from '../../../components/admin/StatusBadge';

const Field = ({ label, value }) => (
  <div>
    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.2rem' }}>{label}</p>
    <p style={{ fontWeight: 500, color: 'var(--color-text)', fontSize: '0.875rem', margin: 0 }}>{value || '—'}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem' }}>
    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1rem' }}>{title}</h3>
    {children}
  </div>
);

const FarmerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getFarmerDetails(id)
      .then((res) => setData(res.data.data))
      .catch((e) => setError(e.response?.data?.message || 'Failed to load farmer details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</div>;
  if (!data) return <div className="alert alert-error">{error || 'Farmer not found.'}</div>;

  const { farmer, consultations, diseaseCases, cropAdvice } = data;

  return (
    <div style={{ maxWidth: 780 }}>
      <button onClick={() => navigate('/expert/farmers')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1565c0', fontWeight: 600, fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.25rem' }}>
        ← Back to My Farmers
      </button>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Header card */}
      <div style={{ background: 'linear-gradient(135deg, #1a6b1a 0%, #2d8c2d 100%)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', color: '#fff' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.5rem', flexShrink: 0 }}>
          {farmer.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>{farmer.name}</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>{farmer.email} · {farmer.loginId}</p>
        </div>
      </div>

      {/* Profile info */}
      <Section title="👤 Farmer Profile">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', padding: '1rem', background: 'var(--color-off-white)', borderRadius: 'var(--radius-md)' }}>
          <Field label="Name"     value={farmer.name} />
          <Field label="Email"    value={farmer.email} />
          <Field label="Mobile"   value={farmer.mobile} />
          <Field label="Login ID" value={farmer.loginId} />
          <Field label="Status"   value={<StatusBadge status={farmer.status} />} />
          <Field label="Joined"   value={fmtDate(farmer.createdAt)} />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.875rem', marginBottom: 0 }}>
          ℹ️ Only information relevant to agricultural assistance is displayed. You cannot edit farmer data.
        </p>
      </Section>

      {/* Consultation history */}
      <Section title={`🗓️ Consultation History (${consultations.length})`}>
        {consultations.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No consultations yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {consultations.map((c) => (
              <div key={c._id} onClick={() => navigate(`/expert/consultations/${c._id}`)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--color-off-white)', borderRadius: 'var(--radius-md)', cursor: 'pointer', flexWrap: 'wrap', gap: '0.5rem' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f7ff')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-off-white)')}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.82rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.problemTitle}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>🌾 {c.cropName} · {fmtDate(c.createdAt)}</p>
                </div>
                <StatusBadge status={c.status} size="xs" />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Disease cases */}
      <Section title={`🦠 Disease Cases (${diseaseCases.length})`}>
        {diseaseCases.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No disease cases.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {diseaseCases.map((d) => (
              <div key={d._id} onClick={() => navigate(`/expert/disease/${d._id}`)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--color-off-white)', borderRadius: 'var(--radius-md)', cursor: 'pointer', flexWrap: 'wrap', gap: '0.5rem' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-off-white)')}
              >
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.82rem', margin: 0 }}>{d.cropName}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>{fmtDate(d.createdAt)}</p>
                </div>
                <StatusBadge status={d.status} size="xs" />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Crop advice */}
      <Section title={`🌱 Crop Advice Given (${cropAdvice.length})`}>
        {cropAdvice.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No crop advice given yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {cropAdvice.map((a) => (
              <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--color-off-white)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.82rem', margin: 0 }}>🌾 {a.cropName}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>{a.recommendedActions}</p>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(a.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};

export default FarmerDetails;
