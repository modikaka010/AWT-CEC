import React from 'react';
import { Link } from 'react-router-dom';

const BENEFITS = [
  {
    icon: '🌱',
    title: 'Better Farm Management',
    desc: 'Track multiple crops, soil health parameters, sowing-to-harvest schedules, and farm expenses with intelligent tracking tools.',
    tag: 'Efficiency',
  },
  {
    icon: '🤝',
    title: 'Direct Market Connections',
    desc: 'Eliminate exploitative intermediaries. Connect directly with institutional and retail buyers with transparent fair price discovery.',
    tag: 'Higher Profits',
  },
  {
    icon: '🔬',
    title: 'Expert Agricultural Guidance',
    desc: 'Submit crop disease symptoms, get photo-verified diagnostic prescriptions, and receive seasonal advice from certified agronomists.',
    tag: 'Crop Health',
  },
  {
    icon: '📊',
    title: 'Informed Farming Decisions',
    desc: 'Access real-time APMC mandi price trends, localized agro-weather forecasts, and verified government scheme benefits.',
    tag: 'Data-Driven',
  },
];

const AboutSection = () => {
  return (
    <section id="about-preview" className="section" style={{ background: 'var(--color-white)', position: 'relative' }}>
      <div className="container">
        {/* Section Top Header */}
        <div className="text-center" style={{ marginBottom: '3.5rem' }}>
          <span className="section-badge">About Avelia</span>
          <h2 className="section-title">Bringing Technology to Agriculture</h2>
          <p className="section-subtitle">
            Avelia is an integrated digital ecosystem designed to transform the agriculture supply
            chain — empowering Indian farmers with scientific guidance, equitable commerce, and
            market resilience.
          </p>
        </div>

        {/* 2-Column Storytelling Block with Photography */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3.5rem',
            alignItems: 'center',
            marginBottom: '4.5rem',
          }}
          className="about-split"
        >
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--color-border)',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=900&q=80"
                alt="Farmer checking harvest quality with modern technology"
                style={{ width: '100%', height: '380px', objectFit: 'cover' }}
              />
            </div>
            {/* Experience Pill */}
            <div
              style={{
                position: 'absolute',
                bottom: '-20px',
                right: '20px',
                background: 'var(--color-primary-dark)',
                color: '#FFFFFF',
                padding: '1rem 1.5rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                100% Free
              </div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                For Indian Farming Communities
              </div>
            </div>
          </div>

          <div>
            <span
              style={{
                color: 'var(--color-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
              }}
            >
              Our Purpose & Vision
            </span>
            <h3
              style={{
                fontSize: '1.9rem',
                fontWeight: 800,
                color: 'var(--color-text)',
                margin: '0.6rem 0 1.25rem',
                lineHeight: 1.25,
              }}
            >
              Bridging the gap between the farm gate and consumer market
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              Traditional agricultural marketing in India faces severe fragmentation, high post-harvest
              losses, and lack of timely expert intervention. Avelia provides a single unified digital
              backbone connecting all stakeholders.
            </p>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '1.75rem' }}>
              From crop planning and soil analysis to real-time order negotiation and certified agronomist
              prescriptions, our platform provides tools for sustainable and profitable agriculture.
            </p>

            <Link to="/about" className="btn btn-secondary" style={{ fontWeight: 700 }}>
              Read Full Story & Mission →
            </Link>
          </div>
        </div>

        {/* Four Core Benefits Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {BENEFITS.map((item, idx) => (
            <div
              key={idx}
              className="card-editorial"
              style={{
                padding: '2rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.25rem',
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
                    }}
                  >
                    {item.icon}
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-bg)',
                      color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {item.tag}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .about-split { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </section>
  );
};

export default AboutSection;
