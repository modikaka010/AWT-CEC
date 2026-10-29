import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

const LandingFooter = () => {
  return (
    <footer
      style={{
        background: '#0B291E',
        color: '#FFFFFF',
        padding: '5rem 0 2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="container">
        {/* Main Footer Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
            gap: '3rem',
            paddingBottom: '3.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
          className="footer-grid"
        >
          {/* Col 1: Brand & Bio */}
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <Logo size="md" theme="dark" showTagline={true} />
            </div>
            <p
              style={{
                fontSize: '0.88rem',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
                maxWidth: 340,
                marginBottom: '1.5rem',
              }}
            >
              Avelia is India’s next-generation Farm to Market Management Platform connecting
              farmers, wholesale/retail buyers, and certified agronomists for a sustainable,
              profitable agricultural future.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['🌾 Direct Market', '🔬 Science Backed', '🛡️ Verified'].map((pill, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--color-accent)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(157, 206, 27, 0.25)',
                  }}
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          {/* Col 2: Platform Navigation */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: '1.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              Platform
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {[
                { label: 'Home',               to: '/#home' },
                { label: 'About Avelia',       to: '/#about-preview' },
                { label: 'Agricultural News',  to: '/#news-preview' },
                { label: 'Government Schemes', to: '/#schemes-preview' },
                { label: 'Help & FAQs',        to: '/#help-preview' },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.to}
                    style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.88rem',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Dedicated Portals */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: '1.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              Portals & Roles
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {[
                { label: '🌾 Farmer Dashboard', to: '/login' },
                { label: '🛒 Buyer Marketplace', to: '/login' },
                { label: '🔬 Expert Advisory', to: '/login' },
                { label: '🛡️ Admin Governance', to: '/admin-login' },
                { label: '📝 New Registration', to: '/register' },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.to}
                    style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.88rem',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Agricultural Contact */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: '1.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              National Support
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.75)' }}>
              <div>
                <strong style={{ color: '#FFFFFF', display: 'block' }}>Kisan Helpline (Toll-Free):</strong>
                <span>1800-419-AGRI (2474)</span>
              </div>
              <div>
                <strong style={{ color: '#FFFFFF', display: 'block' }}>Email Support:</strong>
                <span>support@avelia.agri</span>
              </div>
              <div>
                <strong style={{ color: '#FFFFFF', display: 'block' }}>Headquarters:</strong>
                <span>Agri-Tech Park, Sector 62, Noida, UP, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.82rem',
            color: 'rgba(255, 255, 255, 0.55)',
          }}
        >
          <div>
            © {new Date().getFullYear()} Avelia — Farm to Market Management Platform. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/#about-preview"> About Us</Link>
            <Link to="/#help-preview"> Privacy & Terms</Link>
            <Link to="/#schemes-preview"> Gov Schemes</Link>
            <Link to="/admin-login">Admin</Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 2rem !important; }
        }
        @media (max-width: 580px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </footer>
  );
};

export default LandingFooter;
