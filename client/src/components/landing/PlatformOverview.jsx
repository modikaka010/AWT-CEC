import React from 'react';
import { Link } from 'react-router-dom';

const ROLES = [
  {
    role: 'farmer',
    name: 'Farmer',
    badge: 'Producer Portal',
    badgeColor: 'badge-green',
    icon: '🌾',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    title: 'Grow, List & Sell Direct',
    desc: 'Empower your farm with crop lifecycle management, direct wholesale & retail product listings, live weather alerts, and expert consultations.',
    features: [
      'Crop & Field Tracking',
      'Direct Harvest Listings',
      'Order & Delivery Management',
      'Agronomist Disease Support',
      'Expense & Revenue Log',
    ],
    ctaText: 'Join as Farmer',
    ctaLink: '/register?role=farmer',
  },
  {
    role: 'buyer',
    name: 'Buyer',
    badge: 'Marketplace',
    badgeColor: 'badge-lime',
    icon: '🛒',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    title: 'Source Fresh Produce Direct',
    desc: 'Access verified farm-fresh produce directly from local producers with transparent price negotiations, quality assurance, and tracking.',
    features: [
      'Verified Farmer Listings',
      'Direct Price Negotiations',
      'Secure Cart & Checkout',
      'Real-time Order Tracking',
      'Direct Farmer Messaging',
    ],
    ctaText: 'Join as Buyer',
    ctaLink: '/register?role=buyer',
  },
  {
    role: 'expert',
    name: 'Agricultural Expert',
    badge: 'Advisory Panel',
    badgeColor: 'badge-yellow',
    icon: '🔬',
    image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=600&q=80',
    title: 'Guide Farmers with Science',
    desc: 'Review crop disease cases, provide digital diagnosis and chemical/biological treatment prescriptions, and publish advisory bulletins.',
    features: [
      'Farmer Consultation Requests',
      'Photo-Based Disease Triage',
      'Prescription & Dosage Builder',
      'Crop Advisory Publications',
      'Farmer Follow-up Tracking',
    ],
    ctaText: 'Apply as Expert',
    ctaLink: '/register?role=expert',
  },
  {
    role: 'admin',
    name: 'Platform Admin',
    badge: 'Governance',
    badgeColor: 'badge-blue',
    icon: '🛡️',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    title: 'Trust, Safety & Governance',
    desc: 'Verify expert credentials, moderate marketplace quality, oversee disputes and grievances, and manage national news and schemes.',
    features: [
      'Expert Document Verification',
      'Marketplace Moderation',
      'Order & Grievance Resolution',
      'Content Management (CMS)',
      'Ecosystem Analytics',
    ],
    ctaText: 'Admin Portal',
    ctaLink: '/admin-login',
  },
];

const PlatformOverview = () => {
  return (
    <section id="roles" className="section" style={{ background: 'var(--color-bg)', position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div className="text-center" style={{ marginBottom: '3.5rem' }}>
          <span className="section-badge lime">Four Dedicated Roles</span>
          <h2 className="section-title">Built for Every Agricultural Stakeholder</h2>
          <p className="section-subtitle">
            Avelia unites the entire agro-value chain on one platform with role-specific dashboards,
            workflows, and collaborative features.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {ROLES.map((role) => (
            <div
              key={role.role}
              className="card-editorial"
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                background: 'var(--color-surface)',
              }}
            >
              {/* Role Image Preview */}
              <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                <img
                  src={role.image}
                  alt={role.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(14,51,38,0.7) 100%)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '1.25rem',
                    right: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{role.icon}</span>
                    <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.15rem' }}>
                      {role.name}
                    </span>
                  </div>
                  <span className={`badge ${role.badgeColor}`}>{role.badge}</span>
                </div>
              </div>

              {/* Role Card Body */}
              <div
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                    {role.title}
                  </h4>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.6,
                      marginBottom: '1.25rem',
                    }}
                  >
                    {role.desc}
                  </p>

                  <div
                    style={{
                      borderTop: '1px solid var(--color-border-light)',
                      paddingTop: '1rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: 'var(--color-text-muted)',
                        marginBottom: '0.6rem',
                      }}
                    >
                      Key Features
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {role.features.map((feat, fi) => (
                        <li
                          key={fi}
                          style={{
                            fontSize: '0.82rem',
                            color: 'var(--color-text)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>✓</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Link
                  to={role.ctaLink}
                  className={`btn ${role.role === 'admin' ? 'btn-secondary' : 'btn-primary'} btn-full`}
                  style={{ fontWeight: 700 }}
                >
                  {role.ctaText} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformOverview;
