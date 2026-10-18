import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyFarmers } from '../../../services/expertService';
import Pagination from '../../../components/admin/Pagination';

const MyFarmers = () => {
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError('');
    try {
      const res = await getMyFarmers({ search: search || undefined, page, limit: 15 });
      setFarmers(res.data.data.farmers);
      setPagination(res.data.data.pagination);
    } catch { setError('Failed to load farmers.'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(1); }, [load]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput.trim()); };
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>👨‍🌾</span>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>My Farmers</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
            {pagination.total} farmer{pagination.total !== 1 ? 's' : ''} you have assisted
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', maxWidth: 400 }}>
        <input className="form-input" style={{ flex: 1 }} placeholder="Search farmers by name, email, ID…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <button type="submit" className="btn btn-primary btn-sm">Search</button>
        {search && <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setSearchInput(''); }}>Clear</button>}
      </form>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading…</div>
      ) : farmers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👨‍🌾</p>
          <p style={{ color: 'var(--color-text-muted)' }}>
            {search ? `No farmers found for "${search}".` : 'No farmers yet. Accept a consultation request to connect with farmers.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {farmers.map((f) => (
            <div key={f._id} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {/* Farmer header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e8f5e9', color: '#1a6b1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.125rem', flexShrink: 0 }}>
                  {f.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>{f.loginId} · Joined {fmtDate(f.createdAt)}</p>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                {[
                  { label: 'Total', value: f.consultations?.total || 0 },
                  { label: 'Active', value: f.consultations?.active || 0 },
                  { label: 'Disease', value: f.diseaseCases || 0 },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: 'var(--color-off-white)', borderRadius: 'var(--radius-md)', padding: '0.5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1rem', fontWeight: 800, color: '#1565c0', margin: 0 }}>{value}</p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', margin: 0 }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => navigate(`/expert/farmers/${f._id}`)} className="btn btn-primary btn-sm" style={{ flex: 1, background: '#1565c0', borderColor: '#1565c0' }}>
                  View Details
                </button>
                <button onClick={() => navigate(`/expert/consultations?farmer=${f._id}`)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                  Consultations
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination page={pagination.page} pages={pagination.pages} onPage={load} />
    </div>
  );
};

export default MyFarmers;
