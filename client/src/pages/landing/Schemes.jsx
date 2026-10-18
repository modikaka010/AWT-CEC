import React, { useState, useMemo } from 'react';

const ALL_SCHEMES = [
  {
    id: 'pm-kisan',
    title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    category: 'Income Support',
    authority: 'Ministry of Agriculture & Farmers Welfare',
    tagColor: 'badge-green',
    icon: '💰',
    summary: 'Direct income support of ₹6,000 per year provided in 3 equal four-monthly installments to all landholding farmer families.',
    details: [
      'Financial benefit of ₹6,000 per annum credited directly via DBT to Aadhaar-linked bank accounts.',
      'Applicable to all landholder farmer families with cultivable land holdings.',
      'Exclusions apply to institutional landholders, tax-paying professionals, and constitutional post holders.',
      'Paperless enrollment through local CSC centers or online at pmkisan.gov.in.',
    ],
    documents: ['Aadhaar Card', 'Land Ownership / Khasra-Khatauni records', 'Active Bank Passbook'],
    portal: 'https://pmkisan.gov.in',
  },
  {
    id: 'pmfby',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    category: 'Crop Insurance',
    authority: 'Ministry of Agriculture & Farmers Welfare',
    tagColor: 'badge-yellow',
    icon: '🛡️',
    summary: 'Comprehensive yield and crop loss insurance shield against unseasonal rain, pest outbreaks, drought, and cyclone damage.',
    details: [
      'Extremely subsidized premium rates: 1.5% for Rabi crops, 2.0% for Kharif crops, and 5.0% for Horticultural/Commercial crops.',
      'Covers pre-sowing losses, localized calamity damage, mid-season adversity, and post-harvest losses up to 14 days.',
      'Digital crop loss survey via satellite imagery and smartphone crop cutting experiments for rapid claim settlement.',
    ],
    documents: ['Land Records (LPC/ROR)', 'Sowing Certificate from Patwari', 'Bank Account / KCC Details'],
    portal: 'https://pmfby.gov.in',
  },
  {
    id: 'kcc',
    title: 'Kisan Credit Card (KCC) Scheme',
    category: 'Credit & Finance',
    authority: 'NABARD & Reserve Bank of India',
    tagColor: 'badge-blue',
    icon: '💳',
    summary: 'Adequate and timely institutional credit support with interest subvention for cultivation expenses, crop inputs, and post-harvest requirements.',
    details: [
      'Concessional crop credit up to ₹3 Lakhs at effective interest rate of 4% per annum upon prompt repayment.',
      'No collateral requirement for loans up to ₹1.60 Lakhs.',
      'Extended to animal husbandry, dairy, and fisheries farmers with tailored repayment cycles aligned to harvest.',
    ],
    documents: ['Identity Proof (Aadhaar/Voter ID)', 'Land Records certified by revenue authority', 'Passport photographs'],
    portal: 'https://www.nabard.org',
  },
  {
    id: 'enam',
    title: 'National Agriculture Market (e-NAM)',
    category: 'Market Access',
    authority: 'Small Farmers Agribusiness Consortium (SFAC)',
    tagColor: 'badge-lime',
    icon: '🏪',
    summary: 'Pan-India electronic trading portal integrating physical APMC mandis into a unified transparent national market.',
    details: [
      'Allows farmers to showcase commodity lots to buyers nationwide for competitive price discovery.',
      'Quality assaying infrastructure at participating mandis to grade farm produce prior to auction.',
      'Direct electronic payment into farmer accounts upon successful trade completion.',
    ],
    documents: ['Mandi Trader / Farmer Registration', 'Aadhaar Card', 'Bank Account Details'],
    portal: 'https://enam.gov.in',
  },
  {
    id: 'pkvy',
    title: 'Paramparagat Krishi Vikas Yojana (PKVY)',
    category: 'Organic Farming',
    authority: 'Department of Agriculture & Cooperation',
    tagColor: 'badge-green',
    icon: '🌿',
    summary: 'Financial support and certification assistance to farmer clusters for adopting certified organic farming practices.',
    details: [
      'Financial assistance of ₹50,000 per hectare over 3 years provided to farmer groups.',
      '₹31,000 / ha allocated specifically for organic inputs (bio-fertilizers, vermicompost, bio-pesticides, botanical extracts).',
      'Free Participatory Guarantee System (PGS-India) organic certification and branded packaging support.',
    ],
    documents: ['Farmer Cluster Form', 'Land Verification Certificate', 'Group Bank Account'],
    portal: 'https://pgsindia-ncof.gov.in',
  },
  {
    id: 'soil-health',
    title: 'Soil Health Card Scheme',
    category: 'Soil & Nutrient',
    authority: 'Department of Agriculture & Farmers Welfare',
    tagColor: 'badge-yellow',
    icon: '🧪',
    summary: 'Provides detailed soil nutrient analysis and customized fertilizer recommendations to optimize crop yields and soil quality.',
    details: [
      'Covers 12 essential parameters: Primary nutrients (N, P, K), Secondary nutrients (S), Micronutrients (Zn, Fe, Cu, Mn, Bo), and Physical properties (pH, EC, OC).',
      'Issued free of cost to all farmers every 2 years.',
      'Prevents excessive and imbalanced chemical fertilizer usage, reducing input costs by up to 20%.',
    ],
    documents: ['Farmer Name & Aadhaar', 'Khasra / Plot Number', 'Crop History'],
    portal: 'https://soilhealth.dac.gov.in',
  },
];

const CATEGORIES = ['All', 'Income Support', 'Crop Insurance', 'Credit & Finance', 'Market Access', 'Organic Farming', 'Soil & Nutrient'];

const Schemes = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSchemes = useMemo(() => {
    return ALL_SCHEMES.filter((scheme) => {
      const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;
      const matchesSearch =
        scheme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <>
      {/* Page Header */}
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
            Government Information Directory
          </span>
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 4vw, 3.25rem)',
              fontWeight: 800,
              margin: '0.5rem 0 1.25rem',
              color: '#fff',
            }}
          >
            Agricultural Schemes & Welfare Subsidies
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
              color: 'rgba(255, 255, 255, 0.85)',
              maxWidth: 680,
              margin: '0 auto',
            }}
          >
            Explore verified government welfare programs, subsidy policies, crop insurance, and
            credit schemes designed to assist Indian farmers and agro-enterprises.
          </p>
        </div>
      </section>

      {/* Official Disclaimer Note */}
      <div
        style={{
          background: 'var(--color-warning-bg)',
          borderBottom: '1px solid var(--color-warning-border)',
          padding: '0.85rem 0',
        }}
      >
        <div className="container">
          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--color-warning)',
              textAlign: 'center',
              fontWeight: 600,
              margin: 0,
            }}
          >
            ⚠️ <strong>Transparency Notice:</strong> Avelia is a private agricultural technology platform
            providing informational summaries of public schemes. We are not a government agency. Applications
            must be completed on the respective official government portals.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <section className="section" style={{ background: 'var(--color-bg)' }}>
        <div className="container">
          {/* Search & Filters */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              marginBottom: '3rem',
            }}
          >
            {/* Search Input */}
            <div style={{ maxWidth: 600, width: '100%', margin: '0 auto' }}>
              <input
                type="text"
                className="form-input"
                placeholder="🔍 Search schemes by name, keyword, or benefits..."
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

            {/* Category Pills */}
            <div
              style={{
                display: 'flex',
                gap: '0.6rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
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

          {/* Scheme Cards Grid */}
          {filteredSchemes.length === 0 ? (
            <div
              className="card text-center"
              style={{ padding: '3.5rem 2rem', maxWidth: 500, margin: '0 auto' }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                No schemes match your search
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                Try adjusting your search terms or filter category to find relevant government initiatives.
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
              {filteredSchemes.map((scheme) => (
                <div
                  key={scheme.id}
                  className="card-editorial"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: 'var(--color-white)',
                    padding: '2rem 1.75rem',
                  }}
                >
                  <div>
                    {/* Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '1rem',
                      }}
                    >
                      <span className={`badge ${scheme.tagColor}`}>{scheme.category}</span>
                      <span style={{ fontSize: '1.75rem' }}>{scheme.icon}</span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                      {scheme.title}
                    </h3>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-text-muted)',
                        fontWeight: 600,
                        marginBottom: '1rem',
                      }}
                    >
                      🏛️ {scheme.authority}
                    </div>

                    <p
                      style={{
                        fontSize: '0.9rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.6,
                        marginBottom: '1.25rem',
                      }}
                    >
                      {scheme.summary}
                    </p>

                    {/* Key Details List */}
                    <div
                      style={{
                        background: 'var(--color-bg)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.25rem',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          color: 'var(--color-primary)',
                          marginBottom: '0.5rem',
                        }}
                      >
                        Eligibility & Features
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {scheme.details.map((point, pi) => (
                          <li
                            key={pi}
                            style={{
                              fontSize: '0.82rem',
                              color: 'var(--color-text)',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.5rem',
                              lineHeight: 1.45,
                            }}
                          >
                            <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>✓</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Portal Button */}
                  <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '1rem' }}>
                    <a
                      href={scheme.portal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-full"
                      style={{ fontWeight: 700 }}
                    >
                      Visit Official Ministry Portal ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Schemes;
