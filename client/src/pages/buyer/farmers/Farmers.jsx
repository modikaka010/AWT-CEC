import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFarmers } from '../../../services/buyerService';
import Pagination from '../../../components/admin/Pagination';

const Farmers = () => {
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState([]);
  const [pagination, setPagination] = useState({ page:1, pages:1, total:0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError('');
    try {
      const res = await getFarmers({ search: search || undefined, page, limit:12 });
      setFarmers(res.data.data.farmers);
      setPagination(res.data.data.pagination);
    } catch { setError('Failed to load farmers.'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(1); }, [load]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput.trim()); };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem' }}>
        <span style={{ fontSize:'1.5rem' }}>👨‍🌾</span>
        <div>
          <h2 style={{ fontWeight:800, fontSize:'1.25rem', margin:0 }}>Browse Farmers</h2>
          <p style={{ fontSize:'0.8rem', color:'var(--color-text-muted)', margin:0 }}>{pagination.total} farmers with active listings</p>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom:'1rem' }}>{error}</div>}

      <form onSubmit={handleSearch} style={{ display:'flex', gap:'0.5rem', marginBottom:'1.25rem', maxWidth:400 }}>
        <input className="form-input" style={{ flex:1 }} placeholder="Search farmers…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <button type="submit" className="btn btn-sm" style={{ background:'#c4840e', color:'#fff', borderColor:'#c4840e' }}>Search</button>
        {search && <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setSearchInput(''); }}>Clear</button>}
      </form>

      {loading ? (
        <div style={{ textAlign:'center', padding:'3rem', color:'var(--color-text-muted)' }}>Loading…</div>
      ) : farmers.length === 0 ? (
        <div style={{ textAlign:'center', padding:'3rem', background:'#fff', borderRadius:'var(--radius-lg)', border:'1px solid var(--color-border)' }}>
          <p style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>👨‍🌾</p>
          <p style={{ color:'var(--color-text-muted)' }}>{search ? `No farmers found for "${search}".` : 'No farmers with active listings.'}</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'1rem' }}>
          {farmers.map((f) => (
            <div key={f._id} style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', padding:'1.25rem', transition:'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow='var(--shadow-md)'; e.currentTarget.style.transform='translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='translateY(0)'; }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:'0.875rem', marginBottom:'1rem' }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:'var(--color-primary-muted)', color:'var(--color-primary)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1.125rem', flexShrink:0 }}>
                  {f.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontWeight:700, fontSize:'0.9rem', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</p>
                  <p style={{ fontSize:'0.72rem', color:'var(--color-text-muted)', margin:0 }}>{f.loginId}</p>
                </div>
              </div>

              <div style={{ background:'var(--color-off-white)', borderRadius:'var(--radius-md)', padding:'0.5rem 0.75rem', marginBottom:'0.875rem', textAlign:'center' }}>
                <p style={{ fontSize:'1.25rem', fontWeight:800, color:'#1a6b1a', margin:0 }}>{f.activeProductCount}</p>
                <p style={{ fontSize:'0.68rem', color:'var(--color-text-muted)', margin:0 }}>Active Products</p>
              </div>

              <div style={{ display:'flex', gap:'0.5rem' }}>
                <button onClick={() => navigate(`/buyer/farmers/${f._id}`)} className="btn btn-secondary btn-sm" style={{ flex:1 }}>View Products</button>
                <button onClick={() => navigate(`/buyer/chat/${f._id}`)} className="btn btn-sm" style={{ flex:1, background:'#c4840e', color:'#fff', borderColor:'#c4840e' }}>💬 Chat</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination page={pagination.page} pages={pagination.pages} onPage={load} />
    </div>
  );
};

export default Farmers;
