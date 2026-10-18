import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { scrollToId } from '../../utils/smoothScroll';

// Shown when the API is empty or unreachable
const FALLBACK = [
  { type: 'Scheme', text: 'PM-KISAN: ₹6,000 yearly income support for landholding farmer families', target: 'schemes-preview' },
  { type: 'News',   text: 'Wheat procurement prices rise 8% ahead of Rabi sowing window',           target: 'news-preview' },
  { type: 'Notice', text: 'Register on Avelia free — farmers, buyers and agricultural experts',    target: 'home' },
  { type: 'Scheme', text: 'PMFBY crop insurance: premiums as low as 1.5% for Rabi crops',           target: 'schemes-preview' },
];

const pick = (res, key) => res?.data?.data?.[key] || res?.data?.[key] || [];

const NewsTicker = () => {
  const [items, setItems] = useState(FALLBACK);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [n, s] = await Promise.all([
          api.get('/content/news',    { params: { status: 'published', limit: 6 } }),
          api.get('/content/schemes', { params: { status: 'published', limit: 6 } }),
        ]);
        const live = [
          ...pick(n, 'news').map((x) => ({ type: 'News', text: x.title, target: 'news-preview' })),
          ...pick(s, 'schemes').map((x) => ({ type: 'Scheme', text: x.title, target: 'schemes-preview' })),
        ];
        if (alive && live.length) setItems(live);
      } catch { /* keep fallback */ }
    })();
    return () => { alive = false; };
  }, []);

  // Duplicate the list so the loop is seamless
  const loop = [...items, ...items];
  const duration = Math.max(25, items.length * 7); // seconds, scales with content

  return (
    <>
      <style>{`
        .ticker {
          display: flex; align-items: stretch;
          background: #0E3326; color: #fff;
          font-size: 0.85rem; overflow: hidden;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .ticker-label {
          flex: none; display: flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 1rem; font-weight: 700; letter-spacing: .6px;
          text-transform: uppercase; font-size: 0.75rem;
          background: #D97706; position: relative; z-index: 2;
        }
        .ticker-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #fff;
          animation: tickerPulse 1.4s ease-in-out infinite;
        }
        @keyframes tickerPulse { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
        .ticker-viewport { flex: 1; overflow: hidden; position: relative; display: flex; align-items: center; }
        .ticker-track {
          display: flex; width: max-content;
          animation: tickerScroll var(--ticker-duration, 40s) linear infinite;
        }
        .ticker-viewport:hover .ticker-track,
        .ticker-viewport:focus-within .ticker-track { animation-play-state: paused; }
        @keyframes tickerScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ticker-item {
          display: inline-flex; align-items: center; gap: 0.55rem;
          padding: 0.5rem 2rem; white-space: nowrap;
          background: none; border: none; color: inherit; font: inherit; cursor: pointer;
        }
        .ticker-item:hover .ticker-text { text-decoration: underline; }
        .ticker-tag {
          font-size: 0.68rem; font-weight: 700; padding: 0.1rem 0.45rem;
          border-radius: 4px; background: rgba(255,255,255,0.16); text-transform: uppercase;
        }
        .ticker-sep { opacity: .4; }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track { animation: none; overflow-x: auto; }
        }
        @media (max-width: 560px) { .ticker-label span.t { display: none; } }
      `}</style>

      <div className="ticker" role="region" aria-label="Latest updates">
        <div className="ticker-label"><i className="ticker-dot" /><span className="t">Latest</span></div>
        <div className="ticker-viewport">
          <div className="ticker-track" style={{ '--ticker-duration': `${duration}s` }}>
            {loop.map((it, i) => (
              <button key={i} className="ticker-item" onClick={() => scrollToId(it.target)}>
                <span className="ticker-tag">{it.type}</span>
                <span className="ticker-text">{it.text}</span>
                <span className="ticker-sep">◆</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsTicker;