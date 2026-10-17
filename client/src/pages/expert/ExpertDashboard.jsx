import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardStats } from '../../services/expertService';
import StatusBadge from '../../components/admin/StatusBadge';

const StatCard = ({ icon, label, value, color = '#1565c0', bg = '#e8f0fe', onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: '#fff', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)', padding: '1.125rem 1.25rem',
      display: 'flex', alignItems: 'center', gap: '0.875rem',
      boxShadow: 'var(--shadow-sm)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow 0.2s, transform 0.15s',
    }}
    onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>{label}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 800, color, margin: '0.1rem 0 0' }}>{value ?? '—'}</p>
    </div>
  </div>
);

const ExpertDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentDiseaseCases, setRecentDiseaseCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardStats()
      .then((res) => {
        const d = res.data.data;
        setStats(d.stats);
        setRecentRequests(d.recentRequests || []);
        setRecentDiseaseCases(d.recentDiseaseCases || []);
      })
      .catch(() => setError('Failed to load dashboard data. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => (n == null ? '—' : n.toLocaleString());
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '2rem' }}>⏳</div>
      <p style={{ color: 'var(--color-text-muted)' }}>Loading dashboard…</p>
    </div>
  );

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1b35 0%, #1565c0 100%)',
        borderRadius: 'var(--radius-xl)', padding: '1.5rem 2rem', color: '#fff',
        marginBottom: '1.5rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Expert Portal
          </p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            Welcome, {user?.name?.split(' ')[0] || 'Expert'} 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
            {user?.loginId} · {user?.expertInfo?.specialization || 'Agricultural Expert'}
          </p>
        </div>
        <div style={{ fontSize: '3rem' }}>🔬</div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {/* Alerts — new unassigned work */}
      {(stats?.newUnassignedConsultations > 0 || stats?.newUnassignedDiseaseCases > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {stats.newUnassignedConsultations > 0 && (
            <div onClick={() => navigate('/expert/requests')} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📋</span>
              <div>
                <p style={{ fontWeight: 700, color: '#92400e', fontSize: '0.875rem', margin: 0 }}>
                  {stats.newUnassignedConsultations} New Consultation Request{stats.newUnassignedConsultations !== 1 ? 's' : ''}
                </p>
                <p style={{ color: '#a16207', fontSize: '0.75rem', margin: 0 }}>Click to review and accept</p>
              </div>
            </div>
          )}
          {stats.newUnassignedDiseaseCases > 0 && (
            <div onClick={() => navigate('/expert/disease')} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🦠</span>
              <div>
                <p style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.875rem', margin: 0 }}>
                  {stats.newUnassignedDiseaseCases} New Disease Case{stats.newUnassignedDiseaseCases !== 1 ? 's' : ''}
                </p>
                <p style={{ color: '#b91c1c', fontSize: '0.75rem', margin: 0 }}>Click to review</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon="📋" label="Total Requests"       value={fmt(stats?.totalRequests)}       color="#1565c0" bg="#e8f0fe" onClick={() => navigate('/expert/requests')} />
        <StatCard icon="⏳" label="Pending"               value={fmt(stats?.pendingRequests)}     color="#d4850a" bg="#fef9ec" onClick={() => navigate('/expert/requests?status=pending')} />
        <StatCard icon="🗓️" label="Active Consultations"  value={fmt(stats?.activeConsultations)} color="#7c3aed" bg="#f0e8ff" onClick={() => navigate('/expert/consultations?status=accepted')} />
        <StatCard icon="✅" label="Completed"             value={fmt(stats?.completedConsultations)} color="#1a7a1a" bg="#edf7ed" onClick={() => navigate('/expert/consultations?status=completed')} />
        <StatCard icon="👨‍🌾" label="My Farmers"            value={fmt(stats?.uniqueFarmers)}       color="#0d7490" bg="#e0f7fa" onClick={() => navigate('/expert/farmers')} />
        <StatCard icon="🦠" label="Disease Cases"          value={fmt(stats?.totalDiseaseCases)}   color="#c0392b" bg="#fdf0ef" onClick={() => navigate('/expert/disease')} />
        <StatCard icon="🌱" label="Crop Advice Given"      value={fmt(stats?.totalCropAdvice)}     color="#1a6b1a" bg="#e8f5e9" onClick={() => navigate('/expert/crop-advice')} />
        <StatCard icon="🔔" label="Unread Notifications"   value={fmt(stats?.unreadNotifications)} color="#6d28d9" bg="#f5f0ff" onClick={() => navigate('/expert/notifications')} />
      </div>

      {/* Recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Requests */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>Recent Consultation Requests</h3>
            <button onClick={() => navigate('/expert/requests')} style={{ fontSize: '0.75rem', color: '#1565c0', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
          </div>
          {recentRequests.length === 0 ? (
            <p style={{ padding: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No consultation requests yet.</p>
          ) : (
            recentRequests.map((r) => (
              <div key={r._id} onClick={() => navigate(`/expert/requests/${r._id}`)} style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f7ff')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e8f0fe', color: '#1565c0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                  {r.farmer?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.8rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.problemTitle}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>{r.farmer?.name} · {fmtDate(r.createdAt)}</p>
                </div>
                <StatusBadge status={r.status} size="xs" />
              </div>
            ))
          )}
        </div>

        {/* Recent Disease Cases */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>Recent Disease Cases</h3>
            <button onClick={() => navigate('/expert/disease')} style={{ fontSize: '0.75rem', color: '#1565c0', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
          </div>
          {recentDiseaseCases.length === 0 ? (
            <p style={{ padding: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No disease cases yet.</p>
          ) : (
            recentDiseaseCases.map((c) => (
              <div key={c._id} onClick={() => navigate(`/expert/disease/${c._id}`)} style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>🦠</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.8rem', margin: 0 }}>{c.cropName}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>{c.farmer?.name} · {fmtDate(c.createdAt)}</p>
                </div>
                <StatusBadge status={c.status} size="xs" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertDashboard;