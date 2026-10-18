import React from 'react';
import { Link } from 'react-router-dom';

const STEPS = [
  {
    step: '01',
    title: 'Create Your Account',
    desc: 'Register in seconds with your name, phone number, and email. Instant OTP authentication keeps your profile secure.',
    icon: '📝',
  },
  {
    step: '02',
    title: 'Choose Your Role',
    desc: 'Select whether you are a Farmer producer, a Produce Buyer, or a Certified Agricultural Expert with verified credentials.',
    icon: '👤',
  },
  {
    step: '03',
    title: 'Connect and Manage',
    desc: 'List farm crops, explore wholesale markets, negotiate orders directly, or consult certified agronomists on crop health.',
    icon: '🌱',
  },
  {
    step: '04',
    title: 'Grow and Trade',
    desc: 'Fulfill verified orders, track delivery stages, diagnose plant diseases, and optimize farm revenue transparently.',
    icon: '🚀',
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="section" style={{ background: 'var(--color-bg)', position: 'relative' }}>
      <div className="container">
        {/* Header */}
        <div className="text-center" style={{ marginBottom: '3.5rem' }}>
          <span className="section-badge lime">Simple 4-Step Process</span>
          <h2 className="section-title">How Avelia Works</h2>
          <p className="section-subtitle">
            Get started in minutes and connect with thousands of farmers, certified experts, and
            active agricultural buyers across the country.
          </p>
        </div>

        {/* Steps Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.75rem',
            position: 'relative',
          }}
        >
          {STEPS.map((item, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                background: 'var(--color-white)',
                padding: '2rem 1.5rem',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
              }}
            >
              {/* Step Number Top Pill */}
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
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'var(--color-primary-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                  }}
                >
                  {item.icon}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--color-accent-dark)',
                    opacity: 0.8,
                  }}
                >
                  {item.step}
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div
          style={{
            marginTop: '3.5rem',
            background: 'var(--color-primary-dark)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem 2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            color: '#FFFFFF',
          }}
          className="how-it-works-cta"
        >
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.3rem' }}>
              Ready to modernize your agricultural workflow?
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', margin: 0 }}>
              Join Avelia today — Free registration for all verified agricultural producers.
            </p>
          </div>
          <Link to="/register" className="btn btn-accent btn-lg" style={{ fontWeight: 700 }}>
            Create Free Account →
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .how-it-works-cta { flex-direction: column; align-items: flex-start !important; }
        }
      `}</style>
    </section>
  );
};

export default HowItWorksSection;
