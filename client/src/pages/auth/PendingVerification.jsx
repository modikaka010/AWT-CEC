import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../../components/common/Logo';

const PendingVerification = () => {
  const location = useLocation();
  const name = location.state?.name || 'Agricultural Specialist';
  const email = location.state?.email || '';

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520, textAlign: 'center' }}>
        {/* Brand Logo */}
        <div className="auth-logo">
          <Link to="/" title="Go to Avelia Homepage">
            <Logo size="md" showTagline={true} />
          </Link>
        </div>

        {/* Status Icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--color-warning-bg)',
            border: '2px solid var(--color-warning-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 1.25rem',
          }}
        >
          ⏳
        </div>

        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
          Application Under Review
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
          Thank you, <strong>{name}</strong>. Your expert credentials have been received.
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Our administrative board is verifying your uploaded academic degrees and certifications. You
          will receive an approval notification at{' '}
          {email && <strong style={{ color: 'var(--color-primary)' }}>{email}</strong>}.
        </p>

        {/* Verification Steps Timeline */}
        <div
          style={{
            background: 'var(--color-bg)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            padding: '1.25rem',
            textAlign: 'left',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: '0.8rem',
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '0.85rem',
            }}
          >
            Verification Progress
          </div>
          {[
            { icon: '✅', label: 'Email verified & registration submitted', done: true },
            { icon: '📑', label: 'Admin review of certificates & identity', done: false, current: true },
            { icon: '📧', label: 'Dispatch of activation confirmation email', done: false },
            { icon: '🚀', label: 'Full access to Expert Consultation Dashboard', done: false },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.6rem',
                fontSize: '0.85rem',
              }}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
              <span
                style={{
                  color: item.done
                    ? 'var(--color-primary)'
                    : item.current
                    ? 'var(--color-text)'
                    : 'var(--color-text-muted)',
                  fontWeight: item.done || item.current ? 700 : 400,
                }}
              >
                {item.label}
              </span>
              {item.done && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.7rem',
                    background: 'var(--color-primary-muted)',
                    color: 'var(--color-primary)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700,
                  }}
                >
                  Completed
                </span>
              )}
              {item.current && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.7rem',
                    background: 'var(--color-warning-bg)',
                    color: 'var(--color-warning)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700,
                  }}
                >
                  In Review
                </span>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            background: 'var(--color-info-bg)',
            border: '1px solid var(--color-info-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.82rem',
            color: 'var(--color-info)',
            textAlign: 'left',
          }}
        >
          ⏱ Standard review turnaround is <strong>1–2 business days</strong>.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link to="/login" className="btn btn-primary btn-full">
            Check Status via Login
          </Link>
          <Link to="/" className="btn btn-secondary btn-full">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PendingVerification;
