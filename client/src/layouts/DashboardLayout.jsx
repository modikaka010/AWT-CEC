import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/common/Logo';

/**
 * DashboardLayout — shared sidebar + topbar shell used by all four role layouts.
 *
 * Props:
 *   navItems   – [{ icon, label, to }]  sidebar links
 *   accentColor – CSS colour string     for active nav highlight
 *   accentBg    – CSS colour string     for sidebar background
 *   roleLabel   – string                shown in sidebar header
 *   roleIcon    – string emoji
 */
const DashboardLayout = ({ navItems = [], accentColor = 'var(--color-primary)', accentBg = '#0f2e0f', roleLabel = '', roleIcon = '🌱' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <div style={{ padding: '1.375rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Logo size="xs" theme="dark" showTagline={false} />
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
          fontSize: 'var(--font-size-xs)', fontWeight: 600,
          padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
        }}>
          {roleIcon} {roleLabel}
        </span>
      </div>

      {/* User info */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: accentColor, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 'var(--font-size-md)',
          marginBottom: '0.5rem',
        }}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <p style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: '#e0f0e0', margin: 0, lineHeight: 1.3 }}>
          {user?.name || 'User'}
        </p>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
          {user?.loginId || user?.email}
        </p>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '0.75rem 0.625rem', overflowY: 'auto' }} aria-label="Dashboard navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)',
              marginBottom: '0.125rem', textDecoration: 'none',
              fontWeight: isActive ? 700 : 500,
              fontSize: 'var(--font-size-sm)',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
              background: isActive ? accentColor : 'transparent',
              transition: 'all 0.15s',
            })}
          >
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '0.75rem 0.625rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            width: '100%', padding: '0.625rem 0.75rem',
            borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)',
            fontWeight: 500, transition: 'all 0.15s', cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(192,57,43,0.25)'; e.currentTarget.style.color = '#ff8a80'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .dashboard-layout {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: var(--color-bg);
        }
        .dashboard-sidebar {
          width: 240px;
          flex-shrink: 0;
          background: ${accentBg};
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .dashboard-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .dashboard-topbar {
          height: 56px;
          background: var(--color-white);
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
          gap: 1rem;
          flex-shrink: 0;
        }
        .dashboard-content {
          flex: 1;
          overflow-y: auto;
        }
        .dashboard-overlay {
          display: none;
        }
        @media (max-width: 767px) {
          .dashboard-sidebar {
            position: fixed;
            top: 0; left: 0; bottom: 0;
            z-index: 200;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            width: 260px;
          }
          .dashboard-sidebar.open {
            transform: translateX(0);
          }
          .dashboard-overlay.open {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            z-index: 199;
          }
          .hamburger-btn {
            display: flex !important;
          }
        }
      `}</style>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className={`dashboard-sidebar${sidebarOpen ? ' open' : ''}`}>
          <SidebarContent />
        </aside>

        {/* Mobile overlay */}
        <div
          className={`dashboard-overlay${sidebarOpen ? ' open' : ''}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* Main area */}
        <div className="dashboard-main">
          {/* Top bar */}
          <header className="dashboard-topbar">
            {/* Mobile hamburger */}
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle sidebar"
              style={{
                display: 'none',
                flexDirection: 'column', gap: 4, padding: 4,
                color: 'var(--color-text)',
              }}
            >
              {[0,1,2].map((i) => (
                <span key={i} style={{ display: 'block', width: 20, height: 2, background: 'currentColor', borderRadius: 2 }} />
              ))}
            </button>

            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', marginRight: 'auto' }}>
              {roleIcon} {roleLabel} Dashboard
            </span>

            {/* User chip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'var(--color-off-white)', borderRadius: 'var(--radius-full)',
              padding: '0.3rem 0.875rem 0.3rem 0.3rem',
              border: '1px solid var(--color-border)',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: accentColor, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 'var(--font-size-sm)',
              }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                {user?.name?.split(' ')[0] || 'User'}
              </span>
            </div>
          </header>

          {/* Page content */}
          <main className="dashboard-content">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
