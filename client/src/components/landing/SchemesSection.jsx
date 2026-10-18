import React from 'react';
import { Link } from 'react-router-dom';

const FEATURED_SCHEMES = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN Samman Nidhi',
    category: 'Direct Income Support',
    benefit: '₹6,000 / year in 3 equal installments',
    eligibility: 'All landholding farmer families across India',
    deadline: 'Continuous Enrollment',
    badge: 'Central Scheme',
    icon: '🌾',
  },
  {
    id: 'pmfby',
    name: 'Pradhan Mantri Fasal Bima Yojana',
    category: 'Crop Insurance',
    benefit: 'Comprehensive risk coverage for post-harvest & weather losses',
    eligibility: 'Farmers growing notified crops in notified areas',
    deadline: 'Kharif / Rabi cut-off dates',
    badge: 'Risk Protection',
    icon: '🛡️',
  },
  {
    id: 'soil-health',
    name: 'Soil Health Card Scheme',
    category: 'Soil & Nutrient Management',
    benefit: 'Free soil testing & customized nutrient guidance every 2 years',
    eligibility: 'All farmers with cultivated agricultural land',
    deadline: 'Ongoing Cycle',
    badge: 'Soil Health',
    icon: '🧪',
  },
];

const SchemesSection = () => {
  return (
    <section id="schemes-preview" className="section" style={{ background: 'var(--color-white)', position: 'relative' }}>
      <div className="container">
        {/* Header with View All Button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '3rem',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <span className="section-badge">Government Initiatives</span>
            <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>
              Agricultural Schemes & Subsidies
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', maxWidth: '560px', margin: 0 }}>
              Discover verified welfare schemes, direct financial grants, and technology subsidies
              available for Indian farmers and agro-entrepreneurs.
            </p>
          </div>
          <Link to="/schemes" className="btn btn-secondary" style={{ fontWeight: 700 }}>
            View All Schemes ({6}) →
          </Link>
        </div>

        {/* 3 Featured Scheme Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {FEATURED_SCHEMES.map((scheme) => (
            <div
              key={scheme.id}
              className="card-editorial"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'var(--color-surface)',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <span className="badge badge-green">{scheme.badge}</span>
                  <span style={{ fontSize: '1.5rem' }}>{scheme.icon}</span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  {scheme.name}
                </h3>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    marginBottom: '1rem',
                  }}
                >
                  {scheme.category}
                </div>

                <div
                  style={{
                    background: 'var(--color-bg)',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    Direct Benefit:
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)' }}>
                    {scheme.benefit}
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  <strong>Eligibility:</strong> {scheme.eligibility}
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--color-border-light)',
                  paddingTop: '1rem',
                  marginTop: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  ⏳ {scheme.deadline}
                </span>
                <Link
                  to="/schemes"
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  Details & Application →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer Note */}
        <div
          style={{
            marginTop: '2.5rem',
            padding: '0.85rem 1.25rem',
            background: 'var(--color-primary-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            fontSize: '0.8rem',
            color: 'var(--color-text-secondary)',
            textAlign: 'center',
          }}
        >
          ℹ️ <strong>Informational Transparency:</strong> Avelia aggregates public agricultural
          welfare schemes to assist rural awareness. Official applications are processed through
          respective Ministry portals.
        </div>
      </div>
    </section>
  );
};

export default SchemesSection;
