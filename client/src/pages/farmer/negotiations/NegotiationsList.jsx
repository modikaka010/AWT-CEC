import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNegotiations } from '../../../services/farmerService';
import StatusBadge from '../../../components/admin/StatusBadge';
import Pagination from '../../../components/admin/Pagination';

const ACCENT = '#1a6b1a';
const STATUS_TABS = [
  { value:'',          label:'All',       color:'#6b7280' },
  { value:'pending',   label:'Pending',   color:'#d4850a' },
  { value:'countered', label:'Countered', color:'#1565c0' },
  { value:'accepted',  label:'Accepted',  color:'#1a7a1a' },
  { value:'rejected',  label:'Rejected',  color:'#c0392b' },
  { value:'cancelled', label:'Cancelled', color:'#6b7280' },
];

const NegotiationsList = () => {
  const navigate = useNavigate();
  const [negotiations, setNegotiations] = useState([]);
  const [pagination, setPagination] = useState({ page:1, pages:1, total:0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError('');
    try {
      const res = await getNegotiations({ status: statusFilter||undefined, page, limit:15 });
      setNegotiations(res.data.data.negotiations);
      setPagination(res.data.data.pagination);
    } catch { setError('Failed to load negotiations.'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(1); }, [load]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
  const fmtCurrency = (n) => n != null ? `₹${n.toLocaleString('en-IN')}` : '—';

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem' }}>
        <span style={{ fontSize:'1.5rem' }}>🤝</span>
        <div>
          <h2 style={{ fontWeight:800, fontSize:'1.25rem', margin:0 }}>Negotiations</h2>
          <p style={{ fontSize:'0.8rem', color:'var(--color-text-muted)', margin:0 }}>{pagination.total} total</p>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom:'1rem' }}>{error}</div>}

      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
        {STATUS_TABS.map((tab) => (
          <button key={tab.value} onClick={() => setStatusFilter(tab.value)} style={{
            padding:'0.35rem 0.875rem', borderRadius:'9999px', fontSize:'0.78rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s',
            border:`2px solid ${statusFilter===tab.value ? tab.color : 'var(--color-border)'}`,
            background: statusFilter===tab.value ? tab.color : '#fff',
            color: statusFilter===tab.value ? '#fff' : 'var(--color-text-secondary)',
          }}>{tab.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'3rem', color:'var(--color-text-muted)' }}>Loading…</div>
      ) : negotiations.length === 0 ? (
        <div style={{ textAlign:'center', padding:'3rem', background:'#fff', borderRadius:'var(--radius-lg)', border:'1px solid var(--color-border)' }}>
          <p style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>🤝</p>
          <p style={{ color:'var(--color-text-muted)' }}>No negotiations yet.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
          {negotiations.map((n) => (
            <div key={n._id} onClick={() => navigate(`/farmer/negotiations/${n._id}`)} style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', padding:'1.25rem', cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow='var(--shadow-md)'; e.currentTarget.style.borderColor=ACCENT; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='var(--color-border)'; }}
            >
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.75rem' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.4rem' }}>
                    <p style={{ fontWeight:700, fontSize:'0.9rem', margin:0 }}>🌾 {n.productName}</p>
                    <StatusBadge status={n.status} size="xs" />
                  </div>
                  <p style={{ fontSize:'0.78rem', color:'var(--color-text-muted)', margin:0 }}>
                    Buyer: {n.buyer?.name || '—'} · Listed: {fmtCurrency(n.listedPrice)} {n.priceUnit}
                  </p>
                  <p style={{ fontSize:'0.78rem', color:'var(--color-text-muted)', margin:'0.2rem 0 0' }}>
                    Updated: {fmtDate(n.updatedAt)}
                  </p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontSize:'0.72rem', color:'var(--color-text-muted)', margin:0 }}>Offer</p>
                  <p style={{ fontWeight:900, fontSize:'1.1rem', color:ACCENT, margin:0 }}>{fmtCurrency(n.currentPrice)} {n.priceUnit}</p>
                  <p style={{ fontSize:'0.72rem', color:'var(--color-text-muted)', margin:0 }}>Qty: {n.currentQuantity}</p>
                </div>
              </div>

              {n.status === 'pending' && (
                <div style={{ marginTop:'0.75rem', padding:'0.4rem 0.875rem', background:'#fef9ec', borderRadius:'var(--radius-md)', fontSize:'0.78rem', color:'#d4850a', fontWeight:600 }}>
                  ⚡ Action required — Review and respond to buyer's offer
                </div>
              )}
              {n.status === 'accepted' && (
                <div style={{ marginTop:'0.75rem', padding:'0.4rem 0.875rem', background:'#edf7ed', borderRadius:'var(--radius-md)', fontSize:'0.78rem', color:ACCENT, fontWeight:600 }}>
                  ✅ Agreed: {fmtCurrency(n.agreedPrice)} × {n.agreedQuantity} units
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <Pagination page={pagination.page} pages={pagination.pages} onPage={load} />
    </div>
  );
};

export default NegotiationsList;
