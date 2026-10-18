import React, { useEffect } from 'react';

/**
 * ConfirmModal
 * Props:
 *   isOpen        bool
 *   title         string
 *   message       string
 *   confirmLabel  string  (default "Confirm")
 *   cancelLabel   string  (default "Cancel")
 *   danger        bool    — red confirm button
 *   onConfirm     fn
 *   onCancel      fn
 *   children      ReactNode  — optional extra content (e.g. textarea for reason)
 *   loading       bool
 */
const ConfirmModal = ({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
  children,
  loading = false,
}) => {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen && !loading) onCancel?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onCancel?.(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: 460,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ fontSize: '1.25rem' }}>{danger ? '⚠️' : 'ℹ️'}</span>
          <h3 id="modal-title" style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--color-text)', margin: 0 }}>
            {title}
          </h3>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem 1.5rem' }}>
          {message && (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: '0 0 1rem' }}>
              {message}
            </p>
          )}
          {children}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--color-border)',
          display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
        }}>
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn btn-secondary btn-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn btn-sm"
            style={{
              background: danger ? 'var(--color-error)' : 'var(--color-primary)',
              color: '#fff',
              borderColor: danger ? 'var(--color-error)' : 'var(--color-primary)',
              minWidth: 90,
            }}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
