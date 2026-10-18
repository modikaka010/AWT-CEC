import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ROLE_LABELS = {
  farmer: 'farmer',
  buyer: 'buyer',
  expert: 'expert',
  admin: 'admin',
};

const formatTime = (value) => {
  const date = new Date(value);
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const NotificationBell = ({ role }) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/${role}/notifications`, {
        params: { page: 1, limit: 6 },
      });
      const data = response.data.data;
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not refresh notifications.');
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadNotifications();
    const refresh = () => {
      if (document.visibilityState === 'visible') loadNotifications();
    };
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [loadNotifications]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const markRead = async (notification) => {
    if (notification.isRead) return true;
    try {
      await api.patch(`/${role}/notifications/${notification._id}/read`);
      setNotifications((current) => current.map((item) => (
        item._id === notification._id ? { ...item, isRead: true } : item
      )));
      setUnreadCount((count) => Math.max(0, count - 1));
      setError('');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Could not mark notification as read.');
      return false;
    }
  };

  const handleNotificationClick = (notification) => markRead(notification);

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.patch(`/${role}/notifications/read-all`);
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not mark notifications as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  if (!ROLE_LABELS[role]) return null;

  return (
    <div ref={containerRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          loadNotifications();
        }}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        title="Notifications"
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          color: 'var(--color-text)',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <span aria-hidden="true">🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -5,
            right: -5,
            minWidth: 18,
            height: 18,
            padding: '0 4px',
            borderRadius: 999,
            background: 'var(--color-error)',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--color-surface)',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section
          aria-label="Recent notifications"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 0.65rem)',
            width: 'min(360px, calc(100vw - 2rem))',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.16)',
            zIndex: 500,
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.9rem 1rem', borderBottom: '1px solid var(--color-border)' }}>
            <strong style={{ fontSize: '0.9rem' }}>Notifications</strong>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} disabled={markingAll} style={{ border: 0, background: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>
                {markingAll ? 'Marking…' : 'Mark all read'}
              </button>
            )}
          </div>

          {error && <p role="alert" style={{ margin: 0, padding: '0.65rem 1rem', color: 'var(--color-error)', fontSize: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>{error}</p>}
          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            {loading && notifications.length === 0 ? (
              <p style={{ margin: 0, padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Loading notifications…</p>
            ) : notifications.length === 0 ? (
              <p style={{ margin: 0, padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>You’re all caught up.</p>
            ) : notifications.map((notification) => (
              <button
                key={notification._id}
                type="button"
                onClick={() => handleNotificationClick(notification)}
                style={{
                  width: '100%',
                  display: 'flex',
                  gap: '0.65rem',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  border: 0,
                  borderBottom: '1px solid var(--color-border)',
                  padding: '0.8rem 1rem',
                  background: notification.isRead ? 'var(--color-surface)' : 'var(--color-primary-subtle)',
                  cursor: 'pointer',
                  color: 'inherit',
                }}
              >
                <span aria-hidden="true" style={{ fontSize: '1.1rem' }}>🔔</span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.78rem', lineHeight: 1.4 }}>{notification.title}</strong>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{formatTime(notification.createdAt)}</span>
                  </span>
                  <span style={{ display: 'block', fontSize: '0.74rem', lineHeight: 1.45, color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                    {notification.message}
                  </span>
                </span>
                {!notification.isRead && <span aria-label="Unread" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0, marginTop: 5 }} />}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => { setOpen(false); navigate(`/${role}/notifications`); }}
            style={{ width: '100%', padding: '0.75rem', border: 0, background: 'var(--color-off-white)', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
          >
            View all notifications
          </button>
        </section>
      )}
    </div>
  );
};

export default NotificationBell;
