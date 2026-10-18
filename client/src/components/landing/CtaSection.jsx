import React from 'react';
import { Link } from 'react-router-dom';

const CtaSection = () => {
  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #0E3326 0%, #174C38 60%, #21664B 100%)',
        color: '#FFFFFF',
        padding: '5.5rem 0',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Background radial glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(157, 206, 27, 0.16) 0%, rgba(23, 76, 56, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: 'var(--radius-full)',
              padding: '0.35rem 1.1rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              marginBottom: '1.5rem',
            }}
          >
            Empowering Agriculture Together
          </span>

          <h2
            style={{
              fontSize: 'clamp(2.4rem, 4.5vw, 3.5rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
            }}
          >
            Grow Better. Connect Smarter.
          </h2>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
              color: 'rgba(255, 255, 255, 0.85)',
              lineHeight: 1.65,
              marginBottom: '2.5rem',
            }}
          >
            Join thousands of forward-thinking farmers, buyers, and agricultural scientists transforming
            the agricultural landscape on Avelia.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <Link
              to="/register"
              className="btn btn-accent btn-lg"
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                padding: '0.95rem 2.25rem',
              }}
            >
              Join Avelia →
            </Link>
            <Link
              to="/about"
              className="btn btn-outline-white btn-lg"
              style={{
                fontSize: '1.05rem',
                padding: '0.95rem 2rem',
              }}
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
