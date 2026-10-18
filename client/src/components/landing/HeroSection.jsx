import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80',
    caption: 'Lush Green Fields',
  },
  {
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1920&q=80',
    caption: 'Premium Tea Estates',
  },
  {
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1920&q=80',
    caption: 'Golden Harvest Season',
  },
  {
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1920&q=80',
    caption: 'Smart Farming',
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const goTo = (i) => setCurrent(i);

  return (
    <section id="home" className="hero">
      {/* Background crossfade carousel */}
      <div className="hero-bg" aria-hidden="true">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.image}
            className={`hero-bg-slide${i === current ? ' active' : ''}`}
            style={{ backgroundImage: `url("${slide.image}")` }}
          />
        ))}
        <div className="hero-bg-overlay" />
      </div>

      {/* Foreground content */}
      <div className="container hero-content">
        <span className="hero-pill">
          <span className="hero-pill-dot" />
          Avelia · Farm to Market Platform
        </span>

        <h1 className="hero-title">
          Empowering Farmers with
          <br />
          Smart Technology
        </h1>

        <p className="hero-subtitle">
          Connecting farmers, buyers and agricultural experts through one unified
          platform for smarter farming, direct market access, and better livelihoods.
        </p>

        <div className="hero-cta">
          <Link to="/register" className="btn btn-primary btn-lg hero-btn-primary">
            Get Started →
          </Link>
          <a
            href="#features"
            className="btn btn-lg hero-btn-ghost"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('features');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Explore Platform
          </a>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">4-in-1</div>
            <div className="hero-stat-label">Farmer · Buyer · Expert · Admin</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">100% Direct</div>
            <div className="hero-stat-label">Zero Middlemen Commission</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">Real-time</div>
            <div className="hero-stat-label">Advice & Market Rates</div>
          </div>
        </div>
      </div>

      {/* Caption + dots */}
      <div className="hero-controls">
        <span className="hero-caption">{SLIDES[current].caption}</span>
        <div className="hero-dots">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.image}
              className={`hero-dot${i === current ? ' active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Show slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        .hero {
          position: relative;
          min-height: clamp(560px, 82vh, 760px);
          display: flex;
          align-items: center;
          overflow: hidden;
          isolation: isolate;
        }
        .hero-bg { position: absolute; inset: 0; z-index: -1; }
        .hero-bg-slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          opacity: 0;
          transform: scale(1.06);
          transition: opacity 1.2s ease, transform 6s ease;
        }
        .hero-bg-slide.active {
          opacity: 1;
          transform: scale(1);
        }
        .hero-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            100deg,
            rgba(9, 38, 28, 0.88) 0%,
            rgba(13, 60, 44, 0.74) 45%,
            rgba(20, 83, 45, 0.45) 100%
          );
        }
        .hero-content {
          position: relative;
          z-index: 2;
          padding-top: 4rem;
          padding-bottom: 4.5rem;
          color: #fff;
          max-width: 780px;
        }
        .hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.28);
          color: #EAF7EE;
          border-radius: var(--radius-full);
          padding: 0.4rem 1rem;
          margin-bottom: 1.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
        }
        .hero-pill-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--color-accent);
          box-shadow: 0 0 10px var(--color-accent);
        }
        .hero-title {
          font-size: clamp(2.3rem, 5vw, 3.6rem);
          font-weight: 800;
          line-height: 1.12;
          letter-spacing: -0.02em;
          margin: 0 0 1.25rem;
          color: #FFFFFF;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.35);
        }
        .hero-subtitle {
          font-size: clamp(1rem, 1.8vw, 1.2rem);
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.88);
          max-width: 580px;
          margin: 0 0 2rem;
        }
        .hero-cta { display: flex; gap: 0.85rem; flex-wrap: wrap; }
        .hero-btn-primary {
          background: var(--color-accent);
          border-color: var(--color-accent);
          color: var(--color-primary-dark);
          font-weight: 800;
        }
        .hero-btn-primary:hover { filter: brightness(1.06); color: var(--color-primary-dark); }
        .hero-btn-ghost {
          background: rgba(255, 255, 255, 0.12);
          border: 1.5px solid rgba(255, 255, 255, 0.55);
          color: #FFFFFF;
          -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
        }
        .hero-btn-ghost:hover { background: #FFFFFF; color: var(--color-primary-dark); }
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
          margin-top: 3rem;
          padding-top: 1.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.22);
          max-width: 660px;
        }
        .hero-stat-value { font-size: 1.5rem; font-weight: 800; line-height: 1.1; color: #fff; }
        .hero-stat-label { font-size: 0.78rem; color: rgba(255, 255, 255, 0.72); margin-top: 4px; }
        .hero-controls {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          z-index: 3;
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 var(--space-6) 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .hero-caption {
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.4px;
          text-transform: uppercase;
        }
        .hero-dots { display: flex; gap: 0.5rem; }
        .hero-dot {
          width: 9px; height: 9px; border-radius: 50%;
          border: none; cursor: pointer; padding: 0;
          background: rgba(255, 255, 255, 0.4);
          transition: var(--transition);
        }
        .hero-dot.active { background: var(--color-accent); width: 26px; border-radius: 5px; }

        @media (max-width: 720px) {
          .hero-stats { grid-template-columns: 1fr; gap: 0.85rem; }
          .hero-content { max-width: 100%; }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
