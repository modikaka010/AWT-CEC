import React from 'react';

const STATUS_CONFIG = {
  // User statuses
  active:       { label: 'Active',        bg: '#edf7ed', color: '#1a7a1a', dot: '#1a7a1a' },
  pending:      { label: 'Pending',       bg: '#fef9ec', color: '#d4850a', dot: '#d4850a' },
  rejected:     { label: 'Rejected',      bg: '#fdf0ef', color: '#c0392b', dot: '#c0392b' },
  suspended:    { label: 'Suspended',     bg: '#f5f0ff', color: '#6d28d9', dot: '#6d28d9' },
  // Expert request statuses
  approved:     { label: 'Approved',      bg: '#edf7ed', color: '#1a7a1a', dot: '#1a7a1a' },
  // Product statuses
  sold:         { label: 'Sold',          bg: '#e8f0fe', color: '#1565c0', dot: '#1565c0' },
  hidden:       { label: 'Hidden',        bg: '#f3f4f6', color: '#6b7280', dot: '#6b7280' },
  draft:        { label: 'Draft',         bg: '#f3f4f6', color: '#6b7280', dot: '#6b7280' },
  // Order statuses
  confirmed:    { label: 'Confirmed',     bg: '#e8f0fe', color: '#1565c0', dot: '#1565c0' },
  processing:   { label: 'Processing',    bg: '#fef9ec', color: '#d4850a', dot: '#d4850a' },
  shipped:      { label: 'Shipped',       bg: '#f0e8ff', color: '#7c3aed', dot: '#7c3aed' },
  delivered:    { label: 'Delivered',     bg: '#edf7ed', color: '#1a7a1a', dot: '#1a7a1a' },
  cancelled:    { label: 'Cancelled',     bg: '#fdf0ef', color: '#c0392b', dot: '#c0392b' },
  // Report statuses
  under_review: { label: 'Under Review',  bg: '#fef9ec', color: '#d4850a', dot: '#d4850a' },
  resolved:     { label: 'Resolved',      bg: '#edf7ed', color: '#1a7a1a', dot: '#1a7a1a' },
  // Content statuses
  published:    { label: 'Published',     bg: '#edf7ed', color: '#1a7a1a', dot: '#1a7a1a' },
};

const DEFAULT = { label: 'Unknown', bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af' };

const StatusBadge = ({ status, size = 'sm' }) => {
  const cfg = STATUS_CONFIG[status] || { ...DEFAULT, label: status || 'Unknown' };
  const fontSize = size === 'xs' ? '0.7rem' : size === 'md' ? '0.875rem' : '0.75rem';
  const padding = size === 'xs' ? '0.15rem 0.45rem' : size === 'md' ? '0.3rem 0.8rem' : '0.2rem 0.6rem';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      background: cfg.bg,
      color: cfg.color,
      fontSize,
      fontWeight: 600,
      padding,
      borderRadius: '9999px',
      whiteSpace: 'nowrap',
      letterSpacing: '0.01em',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: cfg.dot, flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
