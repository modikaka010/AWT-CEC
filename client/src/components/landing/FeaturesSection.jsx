import React from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: '🌾',
    title: 'Farm and Crop Management',
    desc: 'Plan sowing cycles, monitor crop growth stages, record soil and irrigation parameters, and manage land parcels with digital farm logs.',
    highlight: 'Lifecycle Tracking',
    color: '#E8F3EE',
    accentColor: '#174C38',
  },
  {
    icon: '🛒',
    title: 'Agricultural Marketplace',
    desc: 'List farm-fresh produce with category filters, transparent pricing per unit, quantity limits, and direct negotiation tools for wholesale and retail.',
    highlight: 'Direct Trade',
    color: '#F3FAD9',
    accentColor: '#84B012',
  },
  {
    icon: '🩺',
    title: 'Expert Consultation',
    desc: 'Connect with certified agronomists and agricultural scientists. Submit detailed field queries with crop symptoms for one-on-one sessions.',
    highlight: 'Certified Experts',
    color: '#FEF8EC',
    accentColor: '#D97706',
  },
  {
    icon: '🔬',
    title: 'Disease Diagnosis & Crop Advice',
    desc: 'Upload high-resolution images of damaged crops, affected leaves, or pests to receive verified diagnostic reports and recommended treatments.',
    highlight: 'Photo Diagnosis',
    color: '#EEF5FC',
    accentColor: '#1D64B4',
  },
  {
    icon: '📊',
    title: 'Market Price Information',
    desc: 'Stay informed with updated daily APMC mandi wholesale rates across major commodities, regional trends, and historical price movements.',
    highlight: 'Live Mandi Rates',
    color: '#F8FAF8',
    accentColor: '#21664B',
  },
  {
    icon: '🏛️',
    title: 'Agricultural News & Schemes',
    desc: 'Explore curated central and state government farmer welfare schemes (PM-KISAN, PMFBY) and timely agricultural research advisories.',
    highlight: 'Verified Schemes',
    color: '#FDF2F1',
    accentColor: '#D93829',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="section" style={{ background: 'var(--color-white)', position: 'relative' }}>
      <div className="container">
        {/* Header */}
        <div className="text-center" style={{ marginBottom: '3.5rem' }}>
          <span className="section-badge">Platform Capabilities</span>
          <h2 className="section-title">Comprehensive Tools for Agricultural Excellence</h2>
          <p className="section-subtitle">
            From soil preparation to market dispatch, Avelia delivers end-to-end capabilities
            empowering farmers, buyers, and agricultural specialists.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2rem',
          }}
        >
          {FEATURES.map((feat, idx) => (
            <div
              key={idx}
              className="card-editorial"
              style={{
                padding: '2.25rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 'var(--radius-lg)',
                      background: feat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.75rem',
                    }}
                  >
                    {feat.icon}
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      background: feat.color,
                      color: feat.accentColor,
                      border: `1px solid ${feat.accentColor}30`,
                    }}
                  >
                    {feat.highlight}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: '0.75rem',
                  }}
                >
                  {feat.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.92rem',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.65,
                    marginBottom: '1.5rem',
                  }}
                >
                  {feat.desc}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '1rem' }}>
                <Link
                  to="/register"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: feat.accentColor,
                  }}
                >
                  <span>Explore in Portal</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
