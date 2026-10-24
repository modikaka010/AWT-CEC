const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

let rafId = null;

export const scrollToId = (id, offset = 76, duration = 900) => {
  const el = document.getElementById(id);
  if (!el) return;

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const startY = window.scrollY;
  const targetY = Math.max(0, el.getBoundingClientRect().top + startY - offset);
  const dist = targetY - startY;

  cancelAnimationFrame(rafId);
  if (reduce || Math.abs(dist) < 2) {
    window.scrollTo(0, targetY);
    return;
  }

  const d = Math.min(1200, Math.max(500, duration * Math.min(1, Math.abs(dist) / 1500 + 0.4)));
  const t0 = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - t0) / d);
    window.scrollTo(0, startY + dist * easeInOutCubic(p));
    if (p < 1) rafId = requestAnimationFrame(step);
  };
  rafId = requestAnimationFrame(step);

  // let the user interrupt with wheel/touch
  const stop = () => cancelAnimationFrame(rafId);
  window.addEventListener('wheel', stop, { once: true, passive: true });
  window.addEventListener('touchstart', stop, { once: true, passive: true });
};

export const scrollToTop = () => {
  cancelAnimationFrame(rafId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};