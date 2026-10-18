import React, { useState, useMemo } from 'react';

const ALL_NEWS = [
  {
    id: 1,
    tag: 'Market',
    tagColor: 'badge-green',
    date: 'Oct 08, 2026',
    readTime: '3 min read',
    icon: '📈',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    title: 'Wheat Procurement Prices Rise 8% Ahead of Rabi Sowing Window',
    summary: 'Minimum support and mandi procurement prices climb by ₹150 per quintal across Northern states, driven by strong domestic processing demand.',
    body: `Wheat procurement prices have witnessed an upward trajectory across key mandis in Punjab, Haryana, Rajasthan, and Madhya Pradesh ahead of the Rabi season.\n\nAgricultural economists highlight that stabilized moisture indices and lower state warehouse buffer carryovers from early 2026 have supported stronger bid prices. Farmers are advised to maintain optimal seed treatment and align their sowing schedule with soil temperature advisories.\n\nCooperative procurement societies have started electronic slot booking through state APMC portals to minimize transit waiting times for loaded harvest trolleys.`,
  },
  {
    id: 2,
    tag: 'Technology',
    tagColor: 'badge-blue',
    date: 'Oct 05, 2026',
    readTime: '4 min read',
    icon: '🤖',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&q=80',
    title: 'Precision Disease Diagnostic Modules Reduce Crop Loss by 30%',
    summary: 'Field trials demonstrate that rapid smartphone photo diagnosis paired with verified agronomist prescriptions cuts early fungal spread dramatically.',
    body: `University agricultural extension trials in Maharashtra and Gujarat have revealed that early-stage symptom triage through digital channels cuts preventable crop destruction by over 30%.\n\nBy uploading clear high-resolution images of leaf chlorosis, stem lesions, or root rot, farmers can receive customized bio-fungicide or chemical recommendations within hours rather than waiting for physical camp inspections.\n\nAvelia's dedicated expert consultation ecosystem integrates these workflows directly between registered growers and state agricultural university specialists.`,
  },
  {
    id: 3,
    tag: 'Policy',
    tagColor: 'badge-yellow',
    date: 'Sep 28, 2026',
    readTime: '5 min read',
    icon: '📋',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    title: 'Central Government Streamlines DBT Subsidies for Farmer Producer Organizations',
    summary: 'New digitized single-window clearance accelerates solar cold room installation and micro-processing machinery grants for registered FPOs.',
    body: `The Ministry of Agriculture has unveiled a unified portal integration for farmer groups and FPOs to access infrastructure capital subsidies under the Agriculture Infrastructure Fund (AIF).\n\nThe revised framework offers an interest subvention of 3% per annum on loans up to ₹2 Crores for primary sorting, grading, solar drying, and pack-house development.\n\nStates have established district project management units to assist local cooperatives with compliance documents and bank loan syndication.`,
  },
  {
    id: 4,
    tag: 'Weather',
    tagColor: 'badge-blue',
    date: 'Sep 22, 2026',
    readTime: '3 min read',
    icon: '🌧️',
    image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=600&q=80',
    title: 'IMD Releases Extended Agro-Meteorological Advisory for Winter Crops',
    summary: 'Favorable soil moisture conditions projected across Gangetic plains, with timely winter showers expected to benefit mustard and gram.',
    body: `The India Meteorological Department (IMD) in collaboration with ICAR has issued its seasonal agro-weather bulletin for the upcoming winter crop cycle.\n\nAdequate sub-surface moisture retained from late monsoon showers is anticipated to provide favorable germination conditions for pulse and oilseed varieties.\n\nGrowers in low-lying coastal pockets are cautioned to ensure adequate drainage channels to mitigate potential water stagnation during localized depression events.`,
  },
  {
    id: 5,
    tag: 'Organic',
    tagColor: 'badge-green',
    date: 'Sep 15, 2026',
    readTime: '4 min read',
    icon: '🌿',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80',
    title: 'Demand for Chemical-Free Certified Pulses and Spices Surges in Urban Markets',
    summary: 'Direct farm-to-consumer platforms report a 45% increase in verified residue-free pigeon pea, cumin, and turmeric procurement orders.',
    body: `Consumer preferences for transparently sourced, residue-free agricultural produce continue to drive premium pricing for certified natural farming clusters.\n\nInstitutional procurement buyers and health-focused grocery chains are increasingly bypassing traditional multi-tier wholesale mandis to contract directly with verified farmer groups.\n\nAvelia's direct marketplace enables organic and natural producers to showcase their certification credentials and negotiate contracts at transparent price premiums.`,
  },
  {
    id: 6,
    tag: 'Export',
    tagColor: 'badge-yellow',
    date: 'Sep 10, 2026',
    readTime: '4 min read',
    icon: '🚢',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=600&q=80',
    title: 'Indian Fresh Produce Shipments Expand into New Global Markets',
    summary: 'Enhanced cold chain protocols and phytosanitary traceability enable record export volumes of mangoes, grapes, and exotic vegetables.',
    body: `Export inspection agencies reported double-digit growth in air and sea refrigerated container dispatches of Indian fresh table grapes, pomegranates, and premium vegetables.\n\nAdoption of QR-code farm traceability has improved overseas customs clearance speeds and buyer confidence across European and Southeast Asian markets.\n\nFarmers adopting standard post-harvest grading techniques have secured up to 35% higher net realization compared to traditional local sales.`,
  },
];

const CATEGORIES = ['All', 'Market', 'Technology', 'Policy', 'Weather', 'Organic', 'Export'];

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

const News = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filteredNews = useMemo(() => {
    return ALL_NEWS.filter((item) => {
      const matchesCat = selectedCategory === 'All' || item.tag === selectedCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <>
      {/* Header */}
      <section
        style={{
          background: 'linear-gradient(175deg, #0E3326 0%, #174C38 60%, #21664B 100%)',
          color: '#fff',
          padding: '5rem 0 4.5rem',
          textAlign: 'center',
          position: 'relative',
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
            }}
          >
            Field Intelligence & Advisories
          </span>
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 4vw, 3.25rem)',
              fontWeight: 800,
              margin: '0.5rem 0 1.25rem',
              color: '#fff',
            }}
          >
            Agricultural News & Market Trends
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
              color: 'rgba(255, 255, 255, 0.85)',
              maxWidth: 640,
              margin: '0 auto',
            }}
          >
            Verified research advisories, APMC spot price developments, seasonal weather bulletins,
            and agricultural policy analysis.
          </p>
        </div>
      </section>

      {/* Main News Section */}
      <section className="section" style={{ background: 'var(--color-bg)' }}>
        <div className="container">
          {/* Search and Category Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3rem' }}>
            <div style={{ maxWidth: 600, width: '100%', margin: '0 auto' }}>
              <input
                type="text"
                className="form-input"
                placeholder="🔍 Search articles, crops, or market reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.85rem 1.25rem',
                  fontSize: '1rem',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.5rem 1.1rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    background: selectedCategory === cat ? 'var(--color-primary)' : 'var(--color-white)',
                    color: selectedCategory === cat ? '#FFFFFF' : 'var(--color-text-secondary)',
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? 'var(--color-primary)' : 'var(--color-border)',
                    boxShadow: selectedCategory === cat ? '0 2px 8px rgba(23,76,56,0.2)' : 'none',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* News Grid */}
          {filteredNews.length === 0 ? (
            <div className="card text-center" style={{ padding: '3.5rem 2rem', maxWidth: 500, margin: '0 auto' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📰</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                No news articles match your search
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                Try adjusting your search criteria or category filter.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '2rem',
              }}
            >
              {filteredNews.map((article) => {
                const isExpanded = expandedId === article.id;
                return (
                  <article
                    key={article.id}
                    className="card-editorial"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      background: 'var(--color-white)',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ height: 210, overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={article.image}
                        alt={article.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_IMG;
                        }}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                      <span
                        className={`badge ${article.tagColor}`}
                        style={{ position: 'absolute', top: 12, left: 12 }}
                      >
                        {article.tag}
                      </span>
                    </div>

                    <div
                      style={{
                        padding: '1.75rem',
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
                          <span>📅 {article.date}</span>
                          <span>•</span>
                          <span>⏱️ {article.readTime}</span>
                        </div>

                        <h3
                          style={{
                            fontSize: '1.2rem',
                            fontWeight: 800,
                            lineHeight: 1.35,
                            marginBottom: '0.75rem',
                            color: 'var(--color-text)',
                          }}
                        >
                          {article.title}
                        </h3>

                        <p
                          style={{
                            fontSize: '0.88rem',
                            color: 'var(--color-text-secondary)',
                            lineHeight: 1.6,
                            marginBottom: '1rem',
                          }}
                        >
                          {article.summary}
                        </p>

                        {isExpanded && (
                          <div
                            style={{
                              marginTop: '1rem',
                              paddingTop: '1rem',
                              borderTop: '1px solid var(--color-border-light)',
                              fontSize: '0.88rem',
                              color: 'var(--color-text)',
                              lineHeight: 1.7,
                            }}
                          >
                            {article.body.split('\n\n').map((para, pi) => (
                              <p key={pi} style={{ marginBottom: '0.85rem' }}>
                                {para}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          borderTop: '1px solid var(--color-border-light)',
                          paddingTop: '0.85rem',
                          marginTop: '0.5rem',
                        }}
                      >
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : article.id)}
                          style={{
                            color: 'var(--color-primary)',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            cursor: 'pointer',
                          }}
                        >
                          <span>{isExpanded ? 'Show Less' : 'Read Full Report'}</span>
                          <span>{isExpanded ? '↑' : '→'}</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default News;
