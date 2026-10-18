import React from 'react';

const ROLES = [
  {
    value: 'farmer',
    label: 'Farmer',
    description: 'Manage farms, crops, weather, marketplace and expert consultations.',
    icon: '🌾',
  },
  {
    value: 'buyer',
    label: 'Buyer',
    description: 'Browse products, connect with farmers, negotiate and place orders.',
    icon: '🛒',
  },
  {
    value: 'expert',
    label: 'Agricultural Expert',
    description: 'Provide agricultural advice, handle consultations and assist farmers.',
    icon: '🔬',
  },
];

/**
 * RoleSelector — card-style role picker.
 * Props:
 *   selected  – 'farmer' | 'buyer' | 'expert'
 *   onChange  – (role: string) => void
 *   disabled  – bool
 */
const RoleSelector = ({ selected, onChange, disabled = false }) => {
  return (
    <div
      role="radiogroup"
      aria-label="Select your role"
      style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}
    >
      {ROLES.map((role) => {
        const isSelected = selected === role.value;
        return (
          <button
            key={role.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(role.value)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.875rem',
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border-strong)'}`,
              background: isSelected ? 'var(--color-primary-muted)' : 'var(--color-white)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              transition: 'var(--transition)',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <span style={{ fontSize: '1.5rem', lineHeight: 1, marginTop: 2 }}>{role.icon}</span>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 'var(--font-size-md)',
                  color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                  marginBottom: '0.2rem',
                }}
              >
                {role.label}
              </div>
              <div
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.4,
                }}
              >
                {role.description}
              </div>
            </div>
            {/* Radio indicator */}
            <div
              style={{
                marginLeft: 'auto',
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border-strong)'}`,
                background: isSelected ? 'var(--color-primary)' : 'transparent',
                flexShrink: 0,
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isSelected && (
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#fff',
                  }}
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default RoleSelector;
