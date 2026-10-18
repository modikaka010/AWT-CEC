import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSection from '../../components/landing/HeroSection';
import FeaturesSection from '../../components/landing/FeaturesSection';
import HowItWorksSection from '../../components/landing/HowItWorksSection';
import AboutSection from '../../components/landing/AboutSection';
import SchemesSection from '../../components/landing/SchemesSection';
import NewsSection from '../../components/landing/NewsSection';
import HelpSection from '../../components/landing/HelpSection';
import CtaSection from '../../components/landing/CtaSection';
import { scrollToId } from '../../utils/smoothScroll';

const Reveal = ({ children }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('in'); io.disconnect(); } },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className="reveal">{children}</div>;
};

const LandingPage = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => scrollToId(hash.slice(1)), 80);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <div className="landing-page">
      <HeroSection />            {/* hero shows immediately, no reveal */}
      <Reveal><FeaturesSection /></Reveal>
      <Reveal><HowItWorksSection /></Reveal>
      <Reveal><AboutSection /></Reveal>
      <Reveal><SchemesSection /></Reveal>
      <Reveal><NewsSection /></Reveal>
      <Reveal><HelpSection /></Reveal>
      <Reveal><CtaSection /></Reveal>
    </div>
  );
};

export default LandingPage;