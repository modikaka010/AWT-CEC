import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/common/Logo';
import NotificationBell from '../components/common/NotificationBell';

// Sidebar Navigation
const NAV = [
  {
    group: null,
    items: [
      { icon: '📊', label: 'Dashboard', to: '/admin/dashboard', end: true },
    ],
  },
  {
    group: 'User Management',
    items: [
      { icon: '🌾', label: 'Farmers', to: '/admin/users/farmers' },
      { icon: '🛍️', label: 'Buyers', to: '/admin/users/buyers' },
      { icon: '👨‍🔬', label: 'Experts', to: '/admin/users/experts' },
    ],
  },
  {
    group: 'Verification & Trust',
    items: [
      { icon: '✅', label: 'Expert Requests', to: '/admin/verification/requests' },
      { icon: '🧑‍🌾', label: 'Consultations & Advice', to: '/admin/advisories' },
    ],
  },
  {
    group: 'Marketplace Operations',
    items: [
      { icon: '🌿', label: 'Products', to: '/admin/products' },
      { icon: '📦', label: 'Orders Monitor', to: '/admin/orders' },
    ],
  },
  {
    group: 'Governance & Grievances',
    items: [
      { icon: '🚩', label: 'Reports', to: '/admin/reports' },
      { icon: '🔔', label: 'Notifications', to: '/admin/notifications' },
    ],
  },
  {
    group: 'Content (CMS)',
    items: [
      { icon: '📰', label: 'News Management', to: '/admin/content/news' },
      { icon: '🏛️', label: 'Schemes Management', to: '/admin/content/schemes' },
    ],
  },
  {
    group: 'Platform Insights',
    items: [
      { icon: '📈', label: 'Analytics', to: '/admin/analytics' },
    ],
  },
  {
    group: 'Admin Account',
    items: [
      { icon: '👤', label: 'Profile', to: '/admin/profile' },
      { icon: '⚙️', label: 'Settings', to: '/admin/settings' },
    ],
  },
];

const ACCENT = '#174C38';
const ACCENT_BG = '#0E3326';

const usePageTitle = (pathname) => {
  const all = NAV.flatMap((s) => s.items);
  const match = all
    .slice()
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) => pathname.startsWith(item.to));
  return match?.label || 'Admin Portal';
};

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageTitle = usePageTitle(pathname);

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const closeMenu = () => setSidebarOpen(false);

  return (
    <>
      <style>{`
        .admin-layout {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: var(--color-bg);
        }
        .admin-sidebar {
          width: 230px;
          flex-shrink: 0;
          background: ${ACCENT_BG};
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform 0.25s ease;
          border-right: 1px solid rgba(255,255,255,0.08);
        }
        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }
        .admin-topbar {
          height: 60px;
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
          gap: 0.875rem;
          flex-shrink: 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .admin-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.75rem;
        }
        .admin-overlay { display: none; }
        .admin-hamburger { display: none !important; }

        @media (max-width: 860px) {
          .admin-sidebar {
            position: fixed;
            top: 0; left: 0; bottom: 0;
            z-index: 300;
            transform: translateX(-100%);
            width: 250px;
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-overlay.open {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 299;
          }
          .admin-hamburger {
            display: flex !important;
          }
          .admin-content {
            padding: 1.25rem 1rem;
          }
        }
      `}</style>

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`} aria-label="Admin navigation">
          {/* Brand */}
          <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
              <Logo size="xs" theme="dark" showTagline={false} />
            </Link>
            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'rgba(157, 206, 27, 0.15)',
                  color: 'var(--color-accent)',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                🛡️ Admin Governance
              </span>
            </div>
          </div>

          {/* User info */}
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--color-primary-light)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.95rem',
                flexShrink: 0,
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'Administrator'}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                {user?.loginId || user?.email}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, overflowY: 'auto', padding: '0.6rem 0.75rem' }}>
            {NAV.map((section, si) => (
              <div key={si} style={{ marginBottom: '0.5rem' }}>
                {section.group && (
                  <p
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: 'rgba(255,255,255,0.35)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      padding: '0.4rem 0.6rem 0.2rem',
                      margin: 0,
                    }}
                  >
                    {section.group}
                  </p>
                )}
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={closeMenu}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '0.15rem',
                      textDecoration: 'none',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.82rem',
                      color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                      background: isActive ? 'var(--color-primary-light)' : 'transparent',
                      transition: 'all 0.15s',
                    })}
                  >
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {/* Logout */}
          <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                width: '100%',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(217, 56, 41, 0.25)';
                e.currentTarget.style.color = '#FFA8A8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              }}
            >
              🚪 Exit & Logout
            </button>
          </div>
        </aside>

        {/* Mobile overlay */}
        <div className={`admin-overlay${sidebarOpen ? ' open' : ''}`} onClick={closeMenu} aria-hidden="true" />

        <div className="admin-main">
          {/* Top bar */}
          <header className="admin-topbar">
            <button
              className="admin-hamburger"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle menu"
              style={{
                flexDirection: 'column',
                gap: 4,
                padding: 6,
                color: 'var(--color-text)',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{ display: 'block', width: 22, height: 2, background: 'currentColor', borderRadius: 2 }}
                />
              ))}
            </button>

            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-text)', marginRight: 'auto' }}>
              {pageTitle}
            </span>

            {/* User chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <NotificationBell role="admin" />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--color-bg)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.25rem 0.85rem 0.25rem 0.35rem',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: ACCENT,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                  }}
                >
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  {user?.name?.split(' ')[0] || 'Admin'}
                </span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="admin-content">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
