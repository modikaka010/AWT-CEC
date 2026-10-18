import React from 'react';
import { Link } from 'react-router-dom';

const ARTICLES = [
  {
    id: 'news-1',
    title: 'ICAR Releases New Climate-Resilient Mustard & Wheat Varieties for Rabi Season',
    category: 'Agronomy Research',
    date: 'Oct 08, 2026',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    summary: 'New high-yielding seeds offer 25% higher drought tolerance and reduced susceptibility to stem rot in North Indian plains.',
  },
  {
    id: 'news-2',
    title: 'Digital APMC Mandi Integration Surpasses 1,500 Wholesale Markets Nationwide',
    category: 'Market Intelligence',
    date: 'Oct 05, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=600&q=80',
    summary: 'Unified electronic spot trade reaches record monthly volume as farmer producer organisations secure competitive interstate bids.',
  },
  {
    id: 'news-3',
    title: 'Precision Micro-Irrigation Adoption Boosts Groundnut Yields by 34% in Gujarat',
    category: 'Sustainable Farming',
    date: 'Sep 29, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=600&q=80',
    summary: 'Solar-powered sensor drippers combined with fertigation scheduling reduce ground water extraction while improving pod quality.',
  },
];

// Inline SVG fallback shown if an article image fails to load.
const FALLBACK_IMG =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'>
       <defs>
         <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
           <stop offset='0' stop-color='#174C38'/>
           <stop offset='1' stop-color='#21664B'/>
         </linearGradient>
       </defs>
       <rect width='600' height='400' fill='url(#g)'/>
       <circle cx='300' cy='175' r='80' fill='#9DCE1B' opacity='0.18'/>
       <path d='M300 110 C266 144 266 212 300 246 C334 212 334 144 300 110 Z' fill='#9DCE1B'/>
       <text x='300' y='320' font-family='sans-serif' font-size='26' font-weight='700' fill='#EAF7EE' text-anchor='middle'>Avelia</text>
     </svg>`
  );

const NewsSection = () => {
  return (
    <section id="news-preview" className="section" style={{ background: 'var(--color-bg)', position: 'relative' }}>
      <div className="container">
        {/* Header with View All Link */}
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
            <span className="section-badge lime">Agriculture Insights</span>
            <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>
              Agricultural News & Field Advisories
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', maxWidth: '560px', margin: 0 }}>
              Stay updated with scientific crop developments, market price movements, weather alerts,
              and policy shifts.
            </p>
          </div>
          <Link to="/news" className="btn btn-secondary" style={{ fontWeight: 700 }}>
            Read All News ({6}) →
          </Link>
        </div>

        {/* 3 News Articles Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {ARTICLES.map((art) => (
            <article
              key={art.id}
              className="card-editorial"
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                background: 'var(--color-white)',
              }}
            >
              <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                <img
                  src={art.image}
                  alt={art.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.35s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    background: 'rgba(23, 76, 56, 0.92)',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {art.category}
                </span>
              </div>

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
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                      marginBottom: '0.6rem',
                    }}
                  >
                    <span>📅 {art.date}</span>
                    <span>•</span>
                    <span>⏱️ {art.readTime}</span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      lineHeight: 1.4,
                      marginBottom: '0.75rem',
                      color: 'var(--color-text)',
                    }}
                  >
                    {art.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.86rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.6,
                      marginBottom: '1.25rem',
                    }}
                  >
                    {art.summary}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '0.85rem' }}>
                  <Link
                    to="/news"
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    Read Article →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
