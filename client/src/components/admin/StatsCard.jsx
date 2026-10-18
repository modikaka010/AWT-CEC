import React from 'react';

const StatsCard = ({ icon, label, value, sub, color = '#1a6b1a', bg = '#edf7ed', onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: '#fff',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      boxShadow: 'var(--shadow-sm)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow 0.2s, transform 0.15s',
    }}
    onMouseEnter={(e) => {
      if (onClick) {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    <div style={{
      width: 48, height: 48, borderRadius: 'var(--radius-md)',
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.375rem', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ minWidth: 0 }}>
      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
        {label}
      </p>
      <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color, margin: '0.1rem 0 0' }}>
        {value ?? '—'}
      </p>
      {sub && (
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
          {sub}
        </p>
      )}
    </div>
  </div>
);

export default StatsCard;
