import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCropAdviceList } from '../../../services/expertService';
import Pagination from '../../../components/admin/Pagination';

const CropAdvice = () => {
  const navigate = useNavigate();
  const [adviceList, setAdviceList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError('');
    try {
      const res = await getCropAdviceList({ page, limit: 12 });
      setAdviceList(res.data.data.adviceList);
      setPagination(res.data.data.pagination);
    } catch { setError('Failed to load crop advice.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(1); }, [load]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🌱</span>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>Crop Advice</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>{pagination.total} advice records</p>
          </div>
        </div>
        <button onClick={() => navigate('/expert/crop-advice/new')} className="btn btn-primary btn-sm" style={{ background: '#1565c0', borderColor: '#1565c0' }}>
          + New Crop Advice
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading…</div>
      ) : adviceList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌱</p>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>No crop advice given yet.</p>
          <button onClick={() => navigate('/expert/crop-advice/new')} className="btn btn-primary btn-sm" style={{ background: '#1565c0', borderColor: '#1565c0' }}>
            Give First Advice
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {adviceList.map((a) => (
            <div key={a._id} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>🌾 {a.cropName}</p>
                  {a.growthStage && <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: '0.1rem 0 0' }}>Stage: {a.growthStage}</p>}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>{fmtDate(a.createdAt)}</span>
              </div>
              {/* Farmer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e8f5e9', color: '#1a6b1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.7rem', flexShrink: 0 }}>
                  {a.farmer?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{a.farmer?.name || '—'}</span>
              </div>
              {/* Advice preview */}
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 0.875rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {a.recommendedActions}
              </p>
              <button onClick={() => navigate(`/expert/crop-advice/${a._id}`)} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                View / Edit
              </button>
            </div>
          ))}
        </div>
      )}
      <Pagination page={pagination.page} pages={pagination.pages} onPage={load} />
    </div>
  );
};

export default CropAdvice;
