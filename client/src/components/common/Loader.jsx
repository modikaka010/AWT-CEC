import React from 'react';

/**
 * Loader component
 * Props:
 *   size   – 'sm' | 'md' | 'lg'  (default 'md')
 *   color  – CSS color string     (default uses --color-primary)
 *   text   – optional label below spinner
 *   fullPage – stretch to fill viewport
 */
const Loader = ({ size = 'md', color, text, fullPage = false }) => {
  const sizes = { sm: 20, md: 36, lg: 56 };
  const px = sizes[size] || sizes.md;

  const spinnerStyle = {
    width: px,
    height: px,
    border: `${Math.max(2, px / 10)}px solid var(--color-border)`,
    borderTop: `${Math.max(2, px / 10)}px solid ${color || 'var(--color-primary)'}`,
    borderRadius: '50%',
    animation: 'av-spin 0.8s linear infinite',
    flexShrink: 0,
  };

  const wrapper = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...(fullPage && {
      position: 'fixed',
      inset: 0,
      background: 'rgba(255,255,255,0.75)',
      zIndex: 9999,
    }),
  };

  return (
    <>
      <style>{`
        @keyframes av-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={wrapper} role="status" aria-label={text || 'Loading'}>
        <div style={spinnerStyle} />
        {text && (
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            {text}
          </p>
        )}
      </div>
    </>
  );
};

export default Loader;
