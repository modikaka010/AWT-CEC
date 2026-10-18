import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardStats } from '../../services/adminService';
import StatsCard from '../../components/admin/StatsCard';
import StatusBadge from '../../components/admin/StatusBadge';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDashboardStats();
        const { stats: s, recentUsers: ru, recentOrders: ro } = res.data.data;
        setStats(s);
        setRecentUsers(ru || []);
        setRecentOrders(ro || []);
      } catch {
        setError('Failed to load dashboard data. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fmt = (n) => (n === undefined || n === null ? '—' : n.toLocaleString());
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const fmtCurrency = (n) => n !== undefined ? `₹${n.toLocaleString('en-IN')}` : '—';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }}>⏳</div>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2e0f 0%, #1a6b1a 100%)',
        borderRadius: 'var(--radius-xl)', padding: '1.5rem 2rem',
        color: '#fff', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '0.2rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Admin Dashboard
          </p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            Welcome, {user?.name?.split(' ')[0] || 'Admin'} 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
            {user?.loginId} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ fontSize: '3rem' }}>🌱</div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatsCard icon="🌾" label="Total Farmers"   value={fmt(stats?.totalFarmers)}   bg="#e8f5e9" color="#1a6b1a" onClick={() => navigate('/admin/users/farmers')} />
        <StatsCard icon="🛍️" label="Total Buyers"    value={fmt(stats?.totalBuyers)}    bg="#e8f0fe" color="#1565c0" onClick={() => navigate('/admin/users/buyers')} />
        <StatsCard icon="👨‍🔬" label="Total Experts"   value={fmt(stats?.totalExperts)}   bg="#fff3e0" color="#e65100" onClick={() => navigate('/admin/users/experts')} />
        <StatsCard icon="⏳" label="Pending Experts"  value={fmt(stats?.pendingExperts)}  bg="#fdf0ef" color="#c0392b" onClick={() => navigate('/admin/verification/requests')} />
        <StatsCard icon="🌿" label="Total Products"   value={fmt(stats?.totalProducts)}   bg="#e8f5e9" color="#1a6b1a" onClick={() => navigate('/admin/products')} />
        <StatsCard icon="✅" label="Active Products"  value={fmt(stats?.activeProducts)}  bg="#edf7ed" color="#1a7a1a" onClick={() => navigate('/admin/products')} />
        <StatsCard icon="📦" label="Total Orders"     value={fmt(stats?.totalOrders)}     bg="#e8f0fe" color="#1565c0" onClick={() => navigate('/admin/orders')} />
        <StatsCard icon="⏳" label="Pending Orders"   value={fmt(stats?.pendingOrders)}   bg="#fff7ed" color="#c2410c" onClick={() => navigate('/admin/orders')} />
        <StatsCard icon="🚩" label="Pending Reports"  value={fmt(stats?.pendingReports)}  bg="#fdf0ef" color="#c0392b" onClick={() => navigate('/admin/reports')} />
        <StatsCard icon="🧑‍🌾" label="Pending Consultations" value={fmt(stats?.pendingConsultations)} bg="#f3e8ff" color="#6b21a8" onClick={() => navigate('/admin/advisories')} />
        <StatsCard icon="🩺" label="Pending Disease Cases" value={fmt(stats?.pendingDiseaseCases)} bg="#fff7ed" color="#c2410c" onClick={() => navigate('/admin/advisories')} />
        <StatsCard icon="💬" label="Active Consultations" value={fmt(stats?.activeConsultations)} bg="#e0f2fe" color="#0369a1" onClick={() => navigate('/admin/advisories')} />
        <StatsCard icon="✅" label="Completed Consultations" value={fmt(stats?.completedConsultations)} bg="#ecfdf5" color="#047857" onClick={() => navigate('/admin/advisories')} />
        <StatsCard icon="🌱" label="Expert Crop Advice" value={fmt(stats?.totalCropAdvice)} bg="#edf7ed" color="#1a7a1a" onClick={() => navigate('/admin/advisories')} />
      </div>

      {/* Pending Alerts */}
      {(stats?.pendingExperts > 0 || stats?.pendingReports > 0 || stats?.pendingOrders > 0 || stats?.pendingConsultations > 0 || stats?.pendingDiseaseCases > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {stats?.pendingExperts > 0 && (
            <div
              onClick={() => navigate('/admin/verification/requests')}
              style={{
                background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.875rem',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>📋</span>
              <div>
                <p style={{ fontWeight: 700, color: '#92400e', fontSize: '0.875rem', margin: 0 }}>
                  {stats.pendingExperts} Expert Request{stats.pendingExperts !== 1 ? 's' : ''} Pending
                </p>
                <p style={{ color: '#a16207', fontSize: '0.75rem', margin: 0 }}>Click to review</p>
              </div>
            </div>
          )}
          {stats?.pendingReports > 0 && (
            <div
              onClick={() => navigate('/admin/reports')}
              style={{
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.875rem',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🚩</span>
              <div>
                <p style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.875rem', margin: 0 }}>
                  {stats.pendingReports} Report{stats.pendingReports !== 1 ? 's' : ''} Need Attention
                </p>
                <p style={{ color: '#b91c1c', fontSize: '0.75rem', margin: 0 }}>Click to review</p>
              </div>
            </div>
          )}
          {stats?.pendingOrders > 0 && (
            <div
              onClick={() => navigate('/admin/orders')}
              style={{
                background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.875rem',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>📦</span>
              <div>
                <p style={{ fontWeight: 700, color: '#9a3412', fontSize: '0.875rem', margin: 0 }}>
                  {stats.pendingOrders} Order{stats.pendingOrders !== 1 ? 's' : ''} Pending
                </p>
                <p style={{ color: '#c2410c', fontSize: '0.75rem', margin: 0 }}>Click to monitor orders</p>
              </div>
            </div>
          )}
          {(stats?.pendingConsultations > 0 || stats?.pendingDiseaseCases > 0) && (
            <div
              onClick={() => navigate('/admin/advisories')}
              style={{
                background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.875rem',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🧑‍🌾</span>
              <div>
                <p style={{ fontWeight: 700, color: '#5b21b6', fontSize: '0.875rem', margin: 0 }}>
                  {(stats.pendingConsultations || 0) + (stats.pendingDiseaseCases || 0)} Farmer Advisory Request{(stats.pendingConsultations || 0) + (stats.pendingDiseaseCases || 0) !== 1 ? 's' : ''} Pending
                </p>
                <p style={{ color: '#6d28d9', fontSize: '0.75rem', margin: 0 }}>View consultations and disease cases</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Registrations */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', margin: 0 }}>Recent Registrations</h3>
            <button onClick={() => navigate('/admin/users/farmers')} style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              View All →
            </button>
          </div>
          {recentUsers.length === 0 ? (
            <p style={{ padding: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No registrations yet.</p>
          ) : (
            <div>
              {recentUsers.map((u) => (
                <div
                  key={u._id}
                  onClick={() => navigate(`/admin/users/${u._id}`)}
                  style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-subtle)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                    {u.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>{fmtDate(u.createdAt)}</p>
                  </div>
                  <StatusBadge status={u.role} size="xs" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', margin: 0 }}>Recent Orders</h3>
            <button onClick={() => navigate('/admin/orders')} style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              View All →
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <p style={{ padding: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No orders yet.</p>
          ) : (
            <div>
              {recentOrders.map((o) => (
                <div
                  key={o._id}
                  onClick={() => navigate(`/admin/orders/${o._id}`)}
                  style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-subtle)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: '1.25rem' }}>📦</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text)', margin: 0 }}>{o.buyer?.name || '—'} → {o.farmer?.name || '—'}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>{fmtDate(o.createdAt)} · {fmtCurrency(o.totalAmount)}</p>
                  </div>
                  <StatusBadge status={o.status} size="xs" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
