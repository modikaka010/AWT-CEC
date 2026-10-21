import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardStats, getSalesAnalytics } from '../../services/farmerService';
import StatusBadge from '../../components/admin/StatusBadge';
import { BarChart, DonutChart, ChartCard } from '../../pages/admin/analytics/AnalyticsCharts';

const StatCard = ({ icon, label, value, sub, accent }) => (
  <div style={{
    background:'#fff', border:'1px solid var(--color-border)',
    borderRadius:'var(--radius-xl)', padding:'1.25rem',
    borderTop:`3px solid ${accent || '#1a6b1a'}`,
  }}>
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

const FarmerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [dashboardRes, analyticsRes] = await Promise.all([
          getDashboardStats(),
          getSalesAnalytics(),
        ]);
        setDashboardData(dashboardRes.data.data);
        setAnalyticsData(analyticsRes.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const fmtCurrency = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';

  const stats = dashboardData?.stats || {};
  const recentOrders = dashboardData?.recentOrders || [];

  // Analytics chart data
  const trendData = (analyticsData?.monthlyRevenue || []).map((t) => ({
    label: fmtDate(t._id), // uses fmtDate but needs month only - adjust
    value: t.revenue,
  }));

  // Top products data from analytics
  const topProducts = analyticsData?.topProducts || [];

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background:'linear-gradient(135deg, #0f2e0f 0%, #1a6b1a 100%)',
        borderRadius:'var(--radius-xl)', padding:'1.5rem 2rem',
        color:'#fff', marginBottom:'1.5rem',
        display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem',
      }}>
        <div>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.8rem', margin:0 }}>Welcome back 👋</p>
          <h1 style={{ fontWeight:900, fontSize:'1.5rem', margin:'0.2rem 0' }}>{user?.name || 'Farmer'}</h1>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.78rem', margin:0 }}>
            Login ID: <strong>{user?.loginId || '—'}</strong>
          </p>
        </div>
        <div style={{ textAlign:'right' }}>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.75rem', margin:'0 0 0.25rem' }}>Total Revenue</p>
          <p style={{ fontWeight:900, fontSize:'1.75rem', color:'#a8e6a3', margin:0 }}>{fmtCurrency(stats.totalRevenue)}</p>
        </div>
      </div>

      {loading && <div style={{ textAlign:'center', padding:'2rem', color:'var(--color-text-muted)' }}>Loading dashboard…</div>}
      {error && <div className="alert alert-error" style={{ marginBottom:'1rem' }}>{error}</div>}

      {!loading && dashboardData && (
        <>
          {/* Stats grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(175px, 1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
            <StatCard icon="🌾" label="Total Products"    value={stats.totalProducts}    sub={`${stats.activeProducts} active`} accent="#1a6b1a" />
            <StatCard icon="📦" label="Total Orders"      value={stats.totalOrders}      sub={`${stats.pendingOrders} pending`} accent="#1565c0" />
            <StatCard icon="⚙️" label="Active Orders"    value={stats.activeOrders}     sub="Confirmed + processing + shipped" accent="#d4850a" />
            <StatCard icon="✅" label="Delivered"         value={stats.completedOrders}  sub="Completed orders" accent="#1a7a1a" />
            <StatCard icon="💬" label="Unread Messages"   value={stats.unreadMessages}   accent="#c4840e" />
            <StatCard icon="🔔" label="Notifications"     value={stats.unreadNotifications} accent="#c0392b" />
            <StatCard icon="💰" label="Revenue"           value={fmtCurrency(stats.totalRevenue)} sub="From delivered orders" accent="#1a6b1a" />
          </div>

          {/* Charts section - Analytics */}
          {analyticsData && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1rem' }}>
                📈 Sales Analytics
              </h3>

              {/* Monthly Revenue Bar Chart */}
              {trendData.length > 0 && (
                <ChartCard title="📅 Monthly Revenue (Last 6 Months)">
                  <BarChart data={trendData} color="var(--color-primary)" height={160} />
                </ChartCard>
              )}

              {/* Top Products Bar Chart */}
              {topProducts.length > 0 && (
                <ChartCard title="🌟 Top Selling Products">
                  <BarChart data={topProducts.map(p => ({ label: p.productName, value: p.totalQty }))} color="#1565c0" height={160} />
                </ChartCard>
              )}

              {/* Orders by Status Donut */}
              {analyticsData?.ordersByStatus && (
                <ChartCard title="📦 Orders by Status">
                  <DonutChart segments={[
                    { label: 'Pending',   value: analyticsData.ordersByStatus.pending   || 0, color: '#d4850a' },
                    { label: 'Confirmed', value: analyticsData.ordersByStatus.confirmed || 0, color: '#1565c0' },
                    { label: 'Delivered', value: analyticsData.ordersByStatus.delivered || 0, color: '#1a7a1a' },
                    { label: 'Cancelled', value: analyticsData.ordersByStatus.cancelled || 0, color: '#c0392b' },
                  ]} />
                </ChartCard>
              )}
            </div>
          )}

          {/* Recent orders */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
            {/* Recent orders */}
            <div style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', padding:'1.25rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                <h3 style={{ fontWeight:700, fontSize:'0.95rem', margin:0 }}>📦 Recent Orders</h3>
                <button onClick={() => navigate('/farmer/orders')} style={{ fontSize:'0.75rem', color:'#1a6b1a', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>View all →</button>
              </div>
              {recentOrders.length === 0 ? (
                <p style={{ color:'var(--color-text-muted)', fontSize:'0.8rem', textAlign:'center', padding:'1rem 0' }}>No orders yet.</p>
              ) : (
                recentOrders.map((o) => (
                  <div key={o._id} onClick={() => navigate(`/farmer/orders/${o._id}`)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.6rem 0', borderBottom:'1px solid var(--color-border)', cursor:'pointer' }}>
                    <div>
                      <p style={{ fontWeight:600, fontSize:'0.8rem', margin:0 }}>{o.buyer?.name || 'Buyer'}</p>
                      <p style={{ fontSize:'0.7rem', color:'var(--color-text-muted)', margin:0 }}>{fmtDate(o.createdAt)}</p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <p style={{ fontWeight:700, fontSize:'0.85rem', color:'#1a6b1a', margin:0 }}>₹{o.totalAmount?.toLocaleString('en-IN')}</p>
                      <StatusBadge status={o.status} size="xs" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FarmerDashboard;