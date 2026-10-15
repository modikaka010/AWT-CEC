import React, { useState, useMemo } from 'react';

const MANDI_DATA = [
  {
    commodity: 'Wheat (Sharbati)',
    mandi: 'Khanna APMC (Punjab)',
    state: 'Punjab',
    modalPrice: 2450,
    minPrice: 2320,
    maxPrice: 2580,
    trend: '+3.8%',
    trendUp: true,
    arrival: '1,450 Quintals',
    updated: 'Today, 09:30 AM',
  },
  {
    commodity: 'Basmati Paddy (PB-1121)',
    mandi: 'Karnal Mandi (Haryana)',
    state: 'Haryana',
    modalPrice: 3850,
    minPrice: 3600,
    maxPrice: 4100,
    trend: '+5.2%',
    trendUp: true,
    arrival: '2,800 Quintals',
    updated: 'Today, 10:15 AM',
  },
  {
    commodity: 'Mustard Seed (RM-48)',
    mandi: 'Alwar Mandi (Rajasthan)',
    state: 'Rajasthan',
    modalPrice: 5650,
    minPrice: 5400,
    maxPrice: 5850,
    trend: '-1.1%',
    trendUp: false,
    arrival: '920 Quintals',
    updated: 'Today, 08:45 AM',
  },
  {
    commodity: 'Cotton (Medium Staple)',
    mandi: 'Rajkot APMC (Gujarat)',
    state: 'Gujarat',
    modalPrice: 7200,
    minPrice: 6900,
    maxPrice: 7450,
    trend: '+2.4%',
    trendUp: true,
    arrival: '3,100 Quintals',
    updated: 'Today, 11:00 AM',
  },
  {
    commodity: 'Potato (Jyoti)',
    mandi: 'Agra Mandi (Uttar Pradesh)',
    state: 'Uttar Pradesh',
    modalPrice: 1250,
    minPrice: 1100,
    maxPrice: 1400,
    trend: '+6.5%',
    trendUp: true,
    arrival: '5,400 Quintals',
    updated: 'Today, 07:30 AM',
  },
  {
    commodity: 'Soybean (Yellow)',
    mandi: 'Indore APMC (Madhya Pradesh)',
    state: 'Madhya Pradesh',
    modalPrice: 4600,
    minPrice: 4450,
    maxPrice: 4780,
    trend: '-0.8%',
    trendUp: false,
    arrival: '1,800 Quintals',
    updated: 'Today, 09:10 AM',
  },
];

const STATES = ['All States', 'Punjab', 'Haryana', 'Rajasthan', 'Gujarat', 'Uttar Pradesh', 'Madhya Pradesh'];

const MarketPrices = () => {
  const [selectedState, setSelectedState] = useState('All States');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPrices = useMemo(() => {
    return MANDI_DATA.filter((item) => {
      const matchState = selectedState === 'All States' || item.state === selectedState;
      const matchSearch =
        item.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.mandi.toLowerCase().includes(searchTerm.toLowerCase());
      return matchState && matchSearch;
    });
  }, [selectedState, searchTerm]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--color-text)' }}>
          📈 Live APMC Mandi Spot Prices
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', margin: 0 }}>
          Real-time wholesale benchmark rates across major agricultural mandis in India.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ maxWidth: 360, width: '100%' }}>
          <input
            type="text"
            className="form-input"
            placeholder="🔍 Search crop or mandi name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {STATES.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedState(st)}
              className="btn btn-sm"
              style={{
                background: selectedState === st ? 'var(--color-primary)' : 'var(--color-white)',
                color: selectedState === st ? '#FFFFFF' : 'var(--color-text-secondary)',
                border: `1px solid ${selectedState === st ? 'var(--color-primary)' : 'var(--color-border)'}`,
                fontWeight: 600,
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Price Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {filteredPrices.map((item, idx) => (
          <div
            key={idx}
            className="card"
            style={{
              background: '#FFFFFF',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    background: 'var(--color-primary-muted)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  📍 {item.mandi}
                </span>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: item.trendUp ? '#1F7A4D' : '#D93829',
                    background: item.trendUp ? '#EDF8F2' : '#FDF2F1',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {item.trendUp ? '▲' : '▼'} {item.trend}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 0.5rem' }}>
                {item.commodity}
              </h3>

              {/* Modal Price Highlight */}
              <div
                style={{
                  background: 'var(--color-bg)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Modal Mandi Rate
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-primary-dark)' }}>
                    ₹{item.modalPrice.toLocaleString('en-IN')}{' '}
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>/ Qtl</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  <div>Min: ₹{item.minPrice}</div>
                  <div>Max: ₹{item.maxPrice}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>📦 Daily Arrival: <strong>{item.arrival}</strong></span>
                <span>⏱️ {item.updated}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketPrices;
