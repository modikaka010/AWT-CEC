import React from 'react';
import { Link } from 'react-router-dom';
import CtaSection from '../../components/landing/CtaSection';

const TEAM_VALUES = [
  {
    icon: '🌾',
    title: 'Farmer Centricity',
    desc: 'Every feature is built around the real-world operational challenges of Indian farmers — accessible, mobile-first, and zero unnecessary friction.',
  },
  {
    icon: '🛡️',
    title: 'Integrity & Security',
    desc: 'Strict OTP verification, JWT-based data security, and manual credential validation of agricultural experts ensure absolute platform safety.',
  },
  {
    icon: '🔬',
    title: 'Science-Backed Guidance',
    desc: 'Connecting farmers with certified agronomists and plant pathologists for verified crop diagnostic prescriptions and seasonal advisories.',
  },
  {
    icon: '📈',
    title: 'Equitable Market Access',
    desc: 'Transparent price discovery and direct buyer negotiation tools eliminate unfair intermediary margins, boosting net farmer income.',
  },
];

const About = () => (
  <>
    {/* Page Hero */}
    <section
      style={{
        background: 'linear-gradient(175deg, #0E3326 0%, #174C38 60%, #21664B 100%)',
        color: '#fff',
        padding: '5rem 0 4.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <span
          style={{
            display: 'inline-block',
            background: 'rgba(255, 255, 255, 0.12)',
            color: 'var(--color-accent)',
            fontSize: '0.8rem',
            fontWeight: 700,
            padding: '0.35rem 1rem',
            borderRadius: 'var(--radius-full)',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            marginBottom: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          About Avelia
        </span>
        <h1
          style={{
            fontSize: 'clamp(2.2rem, 4vw, 3.25rem)',
            fontWeight: 800,
            margin: '0.5rem 0 1.25rem',
            color: '#fff',
          }}
        >
          Smart Solutions for a Stronger Agriculture
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
            color: 'rgba(255, 255, 255, 0.85)',
            maxWidth: 640,
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Bridging the gap between the field, scientific expertise, and the modern marketplace.
        </p>
      </div>
    </section>

    {/* Mission & Purpose */}
    <section className="section" style={{ background: 'var(--color-white)' }}>
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: '3.5rem',
            alignItems: 'center',
          }}
          className="about-grid"
        >
          <div>
            <span className="section-badge">Our Mission</span>
            <h2 className="section-title" style={{ fontSize: '2.2rem' }}>
              Transforming the Agriculture Supply Chain
            </h2>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                lineHeight: 1.8,
                fontSize: '1.02rem',
                marginBottom: '1.25rem',
              }}
            >
              Indian agriculture is the backbone of the nation, yet millions of small and marginal
              farmers face persistent challenges — fragmented supply chains, asymmetric market
              information, costly intermediaries, and limited access to timely scientific crop
              diagnosis.
            </p>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                lineHeight: 1.8,
                fontSize: '1.02rem',
                marginBottom: '1.75rem',
              }}
            >
              Avelia was engineered as an integrated MERN platform to unite <strong>Farmers</strong>,{' '}
              <strong>Wholesale/Retail Buyers</strong>, and <strong>Certified Agricultural Experts</strong>.
              Through digital harvest catalogs, transparent price negotiation, AI & photo-verified
              agronomist diagnostics, and official scheme aggregation, we bring modern technological
              empowerment to the agricultural community.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Join Avelia Today →
              </Link>
              <Link to="/schemes" className="btn btn-secondary btn-lg">
                Explore Welfare Schemes
              </Link>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: 'var(--radius-2xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--color-border)',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80"
                alt="Modern agriculture farm technology in action"
                style={{ width: '100%', height: '420px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
        }
      `}</style>
    </section>

    {/* Platform Core Values */}
    <section className="section" style={{ background: 'var(--color-bg)' }}>
      <div className="container">
        <div className="text-center" style={{ marginBottom: '3.5rem' }}>
          <span className="section-badge lime">Guiding Principles</span>
          <h2 className="section-title">What Drives Avelia</h2>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {TEAM_VALUES.map((v, i) => (
            <div
              key={i}
              className="card-editorial"
              style={{
                background: 'var(--color-surface)',
                padding: '2.25rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 'var(--radius-xl)',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-primary-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  marginBottom: '1.25rem',
                }}
              >
                {v.icon}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.6rem' }}>
                {v.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <CtaSection />
  </>
);

export default About;
