import React from 'react';

/**
 * Avelia Brand Logo Component
 * Uses the logo image placed at client/public/logo.png
 */

// Logo file inside client/public (BASE_URL is "/" unless you deploy under a sub-path)
const LOGO_SRC = `${import.meta.env.BASE_URL}logo.png`;

// Set to true ONLY if logo.png already contains the "Avelia" name (and tagline).
// The image is then shown on its own and the text is not drawn a second time.
const LOGO_INCLUDES_TEXT = false;

// On dark backgrounds (landing footer, dashboard sidebars) show the logo on a white
// rounded badge so it stays visible. Set to false to show the bare image.
const DARK_BG_BADGE = true;

const Logo = ({
  size = 'md',
  variant = 'full',
  theme = 'light',
  showTagline = true,
  className = '',
  style = {},
}) => {
  const dimensions = {
    xs: { iconSize: 42, textSize: 16, taglineSize: 8, gap: 6 },
    sm: { iconSize: 56, textSize: 32, taglineSize: 9, gap: 8 }, // logo size
    md: { iconSize: 72, textSize: 24, taglineSize: 10, gap: 10 },
    lg: { iconSize: 84, textSize: 32, taglineSize: 12, gap: 12 },
    xl: { iconSize: 96, textSize: 44, taglineSize: 15, gap: 16 },
  }[size] || { iconSize: 60, textSize: 24, taglineSize: 10, gap: 10 };

  const isDark = theme === 'dark';
  const primaryColor = isDark ? '#FFFFFF' : '#174C38';
  const secondaryColor = isDark ? 'rgba(255,255,255,0.75)' : '#667168';
  const accentLime = '#9DCE1B';

  const useBadge = isDark && DARK_BG_BADGE;

  // NOTE: a plain element (not an inner component) so the <img> is not re-created on re-render
  const logoImage = (
    <img
      src={LOGO_SRC}
      alt="Avelia"
      draggable={false}
      style={{
        display: 'block',
        flexShrink: 0,
        height: dimensions.iconSize,
        width: 'auto',
        objectFit: 'contain',
        ...(useBadge
          ? { background: '#FFFFFF', borderRadius: 10, padding: 4, boxSizing: 'border-box' }
          : {}),
      }}
    />
  );

  // Image only (icon variant, or when logo.png already includes the name)
  if (variant === 'icon' || LOGO_INCLUDES_TEXT) {
    return (
      <div
        className={`avelia-logo icon-only ${className}`}
        style={{ display: 'inline-flex', alignItems: 'center', ...style }}
      >
        {logoImage}
      </div>
    );
  }

  return (
    <div
      className={`avelia-logo ${variant} ${theme} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dimensions.gap,
        textDecoration: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      {logoImage}

      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <span
            style={{
              fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: dimensions.textSize,
              letterSpacing: '-0.5px',
              color: primaryColor,
              display: 'inline-flex',
              alignItems: 'baseline',
            }}
          >
            Avelia
          </span>
          {/* Subtle leaf dot accent */}
          <span
            style={{
              display: 'inline-block',
              width: dimensions.textSize * 0.28,
              height: dimensions.textSize * 0.28,
              borderRadius: '50% 0 50% 0',
              background: accentLime,
              marginLeft: -2,
              marginTop: -dimensions.textSize * 0.4,
              transform: 'rotate(-15deg)',
            }}
          />
        </div>

        {showTagline && (
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              fontSize: dimensions.taglineSize,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              color: secondaryColor,
              marginTop: 2,
              whiteSpace: 'nowrap',
            }}
          >
            Farm to Market Platform
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;