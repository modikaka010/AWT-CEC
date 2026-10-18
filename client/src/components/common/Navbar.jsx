import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Logo from './Logo';

const NAV_LINKS = [
  { label: 'Home',     id: 'home' },
  { label: 'Features', id: 'features' },
  { label: 'About',    id: 'about-preview' },
  { label: 'Schemes',  id: 'schemes-preview' },
  { label: 'News',     id: 'news-preview' },
  { label: 'Help',     id: 'help-preview' },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    const map = {
      farmer: '/farmer/dashboard',
      buyer: '/buyer/dashboard',
      expert: '/expert/dashboard',
      admin: '/admin/dashboard',
    };
    return map[user.role] || '/';
  };

  const [activeId, setActiveId] = useState('home');

const goToSection = (e, id) => {
  e.preventDefault();
  setMenuOpen(false);
  if (location.pathname !== '/') {
    navigate(`/#${id}`);          // LandingPage already scrolls to the hash
    return;
  }
  const el = document.getElementById(id);
  if (el) {
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 70,
      behavior: 'smooth',
    });
    window.history.replaceState(null, '', `/#${id}`);
  }
};

// Highlight the link for the section currently on screen
  useEffect(() => {
    if (location.pathname !== '/') return;
    const onScroll = () => {
      let current = NAV_LINKS[0].id;
      NAV_LINKS.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      });
      setActiveId(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  return (
    <>
      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 200;
          background: var(--navbar-bg);
          -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--color-border);
          box-shadow: var(--shadow-sm);
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0.85rem var(--space-6);
        }
        .navbar-links { display: flex; align-items: center; gap: 1.5rem; }
        .navbar-link {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: var(--transition);
          position: relative;
          padding: 0.25rem 0;
        }
        .navbar-link:hover { color: var(--color-primary); }
        .navbar-link.active { color: var(--color-primary); font-weight: 700; }
        .navbar-link.active::after {
          content: '';
          position: absolute;
          left: 0; right: 0; bottom: -4px;
          height: 2px;
          border-radius: 2px;
          background: var(--color-primary);
        }
        .navbar-actions { display: flex; align-items: center; gap: 0.75rem; }
        .navbar-hamburger { display: none; flex-direction: column; gap: 4px; padding: 6px; border: none; background: none; cursor: pointer; color: var(--color-text); }
        .navbar-hamburger span { display:block; width: 22px; height: 2px; border-radius: 2px; background: currentColor; }
        @media (max-width: 880px) {
          .navbar-links { display: none; }
          .navbar-hamburger { display: flex; }
          .navbar-links.open {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            position: absolute;
            top: 100%;
            left: 0; right: 0;
            background: var(--color-surface);
            border-bottom: 1px solid var(--color-border);
            padding: 1rem var(--space-6) 1.25rem;
            gap: 0.9rem;
            box-shadow: var(--shadow-md);
          }
        }
        @media (max-width: 620px) {
          .navbar-actions .btn-hide-sm { display: none; }
        }
      `}</style>

      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ display: 'flex', alignItems: 'center' }} aria-label="Avelia home">
            <Logo size="sm" showTagline={true} />
          </Link>

          <nav className={`navbar-links${menuOpen ? ' open' : ''}`}>
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`/#${link.id}`}
                onClick={(e) => goToSection(e, link.id)}
                className={`navbar-link${location.pathname === '/' && activeId === link.id ? ' active' : ''}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="navbar-actions">
            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="navbar-link btn-hide-sm"
                  style={{ fontWeight: 700, color: 'var(--color-primary)', whiteSpace: 'nowrap' }}
                >
                  🌾 {user.role?.toUpperCase()} Portal
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm btn-hide-sm">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </>
            )}

            <button
              className="navbar-hamburger"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
