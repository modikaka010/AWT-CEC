import React, { useEffect, useState } from 'react';
import { getSalesAnalytics } from '../../services/farmerService';
import StatusBadge from '../../components/admin/StatusBadge';

const ACCENT = '#1a6b1a';
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const StatCard = ({ icon, label, value, sub }) => (
  <div style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', padding:'1.25rem', borderTop:`3px solid ${ACCENT}` }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
      <div>
        <p style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', margin:'0 0 0.4rem' }}>{label}</p>
        <p style={{ fontSize:'1.75rem', fontWeight:900, color:'var(--color-text)', margin:0, lineHeight:1 }}>{value ?? '—'}</p>
        {sub && <p style={{ fontSize:'0.72rem', color:'var(--color-text-muted)', margin:'0.3rem 0 0' }}>{sub}</p>}
      </div>
      <span style={{ fontSize:'1.75rem' }}>{icon}</span>
    </div>
  </div>
);

const SalesAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getSalesAnalytics()
      .then((res) => setData(res.data.data))
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  const fmtCurrency = (n) => `₹${(n||0).toLocaleString('en-IN')}`;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';

  if (loading) return <div style={{ padding:'2rem', textAlign:'center', color:'var(--color-text-muted)' }}>Loading analytics…</div>;
  if (!data) return <div className="alert alert-error">{error || 'Failed to load.'}</div>;

  const maxRevenue = Math.max(...(data.monthlyRevenue?.map((m) => m.revenue) || [1]), 1);

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem' }}>
        <span style={{ fontSize:'1.5rem' }}>📈</span>
        <div>
          <h2 style={{ fontWeight:800, fontSize:'1.25rem', margin:0 }}>Sales Analytics</h2>
          <p style={{ fontSize:'0.8rem', color:'var(--color-text-muted)', margin:0 }}>Revenue and order performance</p>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom:'1rem' }}>{error}</div>}

      {/* Summary stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(175px, 1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        <StatCard icon="💰" label="Total Revenue"    value={fmtCurrency(data.totalRevenue)} sub="From delivered orders" />
        <StatCard icon="✅" label="Delivered Orders" value={data.totalDeliveredOrders} sub="Successfully completed" />
        <StatCard icon="📊" label="Avg Order Value"  value={fmtCurrency(data.avgOrderValue)} />
        <StatCard icon="⏳" label="Pending Orders"   value={data.ordersByStatus?.pending || 0} sub="Awaiting action" />
        <StatCard icon="⚙️" label="Processing"      value={(data.ordersByStatus?.confirmed||0) + (data.ordersByStatus?.processing||0)} />
        <StatCard icon="🚚" label="Shipped"          value={data.ordersByStatus?.shipped||0} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', marginBottom:'1.25rem' }}>
        {/* Monthly revenue chart */}
        <div style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', padding:'1.5rem' }}>
          <h3 style={{ fontWeight:700, fontSize:'1rem', margin:'0 0 1.25rem' }}>📊 Monthly Revenue (Last 6 Months)</h3>
          {data.monthlyRevenue?.length === 0 ? (
            <p style={{ color:'var(--color-text-muted)', textAlign:'center', padding:'2rem 0', fontSize:'0.875rem' }}>No delivered orders yet.</p>
          ) : (
            <div style={{ display:'flex', alignItems:'flex-end', gap:'0.5rem', height:180 }}>
              {data.monthlyRevenue.map((m, i) => {
                const h = Math.max(8, Math.round((m.revenue / maxRevenue) * 150));
                return (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'0.375rem' }}>
                    <p style={{ fontSize:'0.65rem', color:'var(--color-text-muted)', margin:0, textAlign:'center' }}>
                      {fmtCurrency(m.revenue)}
                    </p>
                    <div title={`${MONTHS[m._id.month-1]} ${m._id.year}: ${fmtCurrency(m.revenue)}`} style={{
                      width:'100%', height:h, background: `linear-gradient(180deg, ${ACCENT}, #4caf50)`,
                      borderRadius:'4px 4px 0 0', cursor:'default', transition:'opacity 0.2s',
                    }}
                      onMouseEnter={(e) => { e.target.style.opacity=0.8; }}
                      onMouseLeave={(e) => { e.target.style.opacity=1; }}
                    />
                    <p style={{ fontSize:'0.65rem', color:'var(--color-text-muted)', margin:0, textAlign:'center' }}>
                      {MONTHS[m._id.month-1]}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top products */}
        <div style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', padding:'1.5rem' }}>
          <h3 style={{ fontWeight:700, fontSize:'1rem', margin:'0 0 1.25rem' }}>🏆 Top Products by Revenue</h3>
          {data.topProducts?.length === 0 ? (
            <p style={{ color:'var(--color-text-muted)', textAlign:'center', padding:'2rem 0', fontSize:'0.875rem' }}>No data yet.</p>
          ) : (
            data.topProducts.map((p, i) => (
              <div key={String(p._id)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.625rem 0', borderBottom: i < data.topProducts.length-1 ? '1px solid var(--color-border)' : 'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', background: i === 0 ? '#f5c006' : i === 1 ? '#a8a8a8' : i === 2 ? '#cd7f32' : ACCENT, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:700, flexShrink:0 }}>
                    {i+1}
                  </div>
                  <div>
                    <p style={{ fontWeight:600, fontSize:'0.82rem', margin:0 }}>{p.productName}</p>
                    <p style={{ fontSize:'0.7rem', color:'var(--color-text-muted)', margin:0 }}>{p.totalQty} units sold</p>
                  </div>
                </div>
                <p style={{ fontWeight:700, fontSize:'0.875rem', color:ACCENT, margin:0, flexShrink:0 }}>
                  {fmtCurrency(p.totalRevenue)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Orders by status */}
      <div style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', padding:'1.5rem', marginBottom:'1.25rem' }}>
        <h3 style={{ fontWeight:700, fontSize:'1rem', margin:'0 0 1.25rem' }}>📦 Orders by Status</h3>
        <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
          {Object.entries(data.ordersByStatus || {}).map(([status, count]) => (
            <div key={status} style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'var(--color-off-white)', padding:'0.5rem 0.875rem', borderRadius:'var(--radius-md)', minWidth:100 }}>
              <StatusBadge status={status} size="xs" />
              <span style={{ fontWeight:800, fontSize:'1rem', color:'var(--color-text)' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent delivered */}
      {data.recentDelivered?.length > 0 && (
        <div style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', padding:'1.5rem' }}>
          <h3 style={{ fontWeight:700, fontSize:'1rem', margin:'0 0 1rem' }}>✅ Recent Deliveries</h3>
          {data.recentDelivered.map((o) => (
            <div key={o._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0', borderBottom:'1px solid var(--color-border)' }}>
              <div>
                <p style={{ fontWeight:600, fontSize:'0.82rem', margin:0 }}>{o.buyer?.name || 'Buyer'}</p>
                <p style={{ fontSize:'0.7rem', color:'var(--color-text-muted)', margin:0 }}>{fmtDate(o.createdAt)}</p>
              </div>
              <p style={{ fontWeight:700, color:ACCENT, margin:0 }}>{fmtCurrency(o.totalAmount)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesAnalytics;
