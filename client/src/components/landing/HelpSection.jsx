import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    q: 'How does Avelia ensure fair prices for farmers?',
    a: 'Avelia eliminates middlemen markups by allowing farmers to list produce directly at their chosen price, accept transparent buyer bids, and review real-time APMC mandi benchmark prices.',
  },
  {
    q: 'How does the Expert Consultation and Disease Diagnosis work?',
    a: 'Farmers can upload photos of unhealthy crops with symptom notes. Certified agronomists evaluate the case, diagnose the pathogen or nutrient deficiency, and prescribe specific dosages and prevention steps.',
  },
  {
    q: 'Who can register as a Buyer on Avelia?',
    a: 'Wholesale traders, food processing companies, exporters, local retail grocers, and individual bulk buyers can register to source verified fresh harvest lots directly from growers.',
  },
  {
    q: 'Are Expert accounts verified before they can advise farmers?',
    a: 'Yes. All Agricultural Expert applicants must submit their degree certificates, state council registrations, and professional experience proofs for manual verification by the Avelia Admin panel.',
  },
];

const HelpSection = () => {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section id="help-preview" className="section" style={{ background: 'var(--color-white)', position: 'relative' }}>
      <div className="container">
        {/* Header */}
        <div className="text-center" style={{ marginBottom: '3.5rem' }}>
          <span className="section-badge">Help & FAQ</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Need guidance on getting started with Avelia? Here are common answers regarding our
            platform, roles, and safety features.
          </p>
        </div>

        {/* 2-Column FAQ Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '3rem',
            alignItems: 'flex-start',
          }}
          className="faq-grid"
        >
          {/* Left Column: Interactive Accordion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {FAQS.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    background: isOpen ? 'var(--color-primary-subtle)' : 'var(--color-white)',
                    transition: 'var(--transition)',
                  }}
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                    style={{
                      width: '100%',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      color: isOpen ? 'var(--color-primary)' : 'var(--color-text)',
                      background: 'none',
                    }}
                  >
                    <span>{faq.q}</span>
                    <span
                      style={{
                        fontSize: '1.2rem',
                        transition: 'transform 0.2s',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                      }}
                    >
                      ▾
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '0 1.5rem 1.25rem',
                        fontSize: '0.92rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.65,
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Support Card */}
          <div
            className="card"
            style={{
              background: 'var(--color-bg)',
              padding: '2.25rem 2rem',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '1.25rem',
              }}
            >
              📞
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Still have questions?
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Our dedicated bilingual agro-support team is here to assist farmers and buyers with account setup,
              mandi listings, and technical queries.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.88rem' }}>
                <span>✉️</span>
                <span style={{ fontWeight: 600 }}>support@avelia.agri</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.88rem' }}>
                <span>📱</span>
                <span style={{ fontWeight: 600 }}>Toll-Free: 1800-419-AGRI</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.88rem' }}>
                <span>🕒</span>
                <span style={{ color: 'var(--color-text-muted)' }}>Mon–Sat: 8:00 AM – 7:00 PM</span>
              </div>
            </div>

            <Link to="/help" className="btn btn-primary btn-full" style={{ fontWeight: 700 }}>
              Visit Help Center & Ticket Form →
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .faq-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </section>
  );
};

export default HelpSection;
