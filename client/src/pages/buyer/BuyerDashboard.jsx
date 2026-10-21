import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardStats } from '../../services/buyerService';
import StatusBadge from '../../components/admin/StatusBadge';

const StatCard = ({ icon, label, value, color = '#c4840e', bg = '#fef3dc', onClick }) => (
  <div onClick={onClick} style={{
    background:'#fff', border:'1px solid var(--color-border)',
    borderRadius:'var(--radius-lg)', padding:'1.125rem 1.25rem',
    display:'flex', alignItems:'center', gap:'0.875rem',
    boxShadow:'var(--shadow-sm)',
    cursor: onClick ? 'pointer' : 'default', transition:'box-shadow 0.2s, transform 0.15s',
  }}
    onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.boxShadow='var(--shadow-md)'; e.currentTarget.style.transform='translateY(-1px)'; } }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow='var(--shadow-sm)'; e.currentTarget.style.transform='translateY(0)'; }}
  >
    <div style={{ width:44, height:44, borderRadius:'var(--radius-md)', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.25rem', flexShrink:0 }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize:'0.7rem', color:'var(--color-text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', margin:0 }}>{label}</p>
      <p style={{ fontSize:'1.5rem', fontWeight:800, color, margin:'0.1rem 0 0' }}>{value ?? '—'}</p>
    </div>
  </div>
);

const BuyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardStats()
      .then((res) => {
        const d = res.data.data;
        setStats(d.stats);
        setRecentOrders(d.recentOrders || []);
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => (n == null ? '—' : n.toLocaleString());
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
  const fmtCurrency = (n) => n != null ? `₹${n.toLocaleString('en-IN')}` : '—';

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:'1rem' }}>
      <div style={{ fontSize:'2rem' }}>⏳</div>
      <p style={{ color:'var(--color-text-muted)' }}>Loading dashboard…</p>
    </div>
  );

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background:'linear-gradient(135deg, #2e1a00 0%, #c4840e 100%)',
        borderRadius:'var(--radius-xl)', padding:'1.5rem 2rem', color:'#fff',
        marginBottom:'1.5rem', display:'flex', alignItems:'center',
        justifyContent:'space-between', flexWrap:'wrap', gap:'1rem',
      }}>
        <div>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.75rem', marginBottom:'0.2rem', textTransform:'uppercase', letterSpacing:'0.5px' }}>Buyer Portal</p>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800, margin:0 }}>
            Welcome, {user?.name?.split(' ')[0] || 'Buyer'} 👋
          </h1>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.8rem', margin:'0.25rem 0 0' }}>
            {user?.loginId} · {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>
        <div style={{ fontSize:'3rem' }}>🛒</div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom:'1.5rem' }}>{error}</div>}

      {/* Stats grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(190px, 1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        <StatCard icon="📦" label="Total Orders"        value={fmt(stats?.totalOrders)}       color="#c4840e" bg="#fef3dc" />
        <StatCard icon="⏳" label="Pending Orders"       value={fmt(stats?.pendingOrders)}      color="#d4850a" bg="#fef9ec"/>
        <StatCard icon="🚚" label="Active Orders"        value={fmt(stats?.activeOrders)}       color="#1565c0" bg="#e8f0fe" />
        <StatCard icon="✅" label="Completed"            value={fmt(stats?.completedOrders)}    color="#1a7a1a" bg="#edf7ed"/>
        <StatCard icon="🗂️" label="Cart Items"           value={fmt(stats?.cartItems)}          color="#7c3aed" bg="#f0e8ff"/>
        <StatCard icon="🤝" label="Active Negotiations"  value={fmt(stats?.activeNegotiations)} color="#c4840e" bg="#fef3dc"/>
        <StatCard icon="💬" label="Unread Messages"      value={fmt(stats?.unreadMessages)}     color="#0d7490" bg="#e0f7fa"/>
        <StatCard icon="🔔" label="Notifications"        value={fmt(stats?.unreadNotifications)} color="#6d28d9" bg="#f5f0ff"/>
      </div>

      {/* Recent orders */}
      <div style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
        <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--color-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ fontWeight:700, fontSize:'0.9rem', margin:0 }}>Recent Orders</h3>
          <button onClick={() => navigate('/buyer/orders')} style={{ fontSize:'0.75rem', color:'#c4840e', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>View All →</button>
        </div>
        {recentOrders.length === 0 ? (
          <div style={{ padding:'2rem', textAlign:'center' }}>
            <p style={{ fontSize:'1.75rem', marginBottom:'0.375rem' }}>📦</p>
            <p style={{ color:'var(--color-text-muted)', fontSize:'0.875rem', margin:0 }}>No orders yet.</p>
            <button onClick={() => navigate('/buyer/marketplace')} className="btn btn-sm" style={{ marginTop:'0.75rem', background:'#c4840e', color:'#fff', borderColor:'#c4840e' }}>Browse Marketplace</button>
          </div>
        ) : (
          recentOrders.map((o) => (
            <div key={o._id} onClick={() => navigate(`/buyer/orders/${o._id}`)} style={{ padding:'0.75rem 1.25rem', borderBottom:'1px solid var(--color-border)', display:'flex', alignItems:'center', gap:'0.75rem', cursor:'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#fef9ec')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize:'1.25rem' }}>📦</span>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontWeight:600, fontSize:'0.82rem', margin:0 }}>
                  {o.items?.[0]?.productName || 'Order'}{o.items?.length > 1 ? ` +${o.items.length - 1} more` : ''}
                </p>
                <p style={{ fontSize:'0.72rem', color:'var(--color-text-muted)', margin:0 }}>
                  {o.farmer?.name} · {fmtDate(o.createdAt)} · {fmtCurrency(o.totalAmount)}
                </p>
              </div>
              <StatusBadge status={o.status} size="xs" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;