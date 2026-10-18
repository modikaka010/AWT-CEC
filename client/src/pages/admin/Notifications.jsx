import React, { useEffect, useState, useCallback } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/adminService';
import Pagination from '../../components/admin/Pagination';

const TYPE_ICONS = {
  expert_registration: '📋',
  expert_approved:     '✅',
  expert_rejected:     '❌',
  new_order:           '📦',
  order_status:        '🔄',
  new_report:          '🚩',
  product_hidden:      '🚫',
  system:              '🔔',
  content:             '📰',
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError('');
    try {
      const res = await getNotifications({ page, limit: 20 });
      const { notifications: notifs, unreadCount: uc, pagination: pg } = res.data.data;
      setNotifications(notifs);
      setUnreadCount(uc);
      setPagination(pg);
    } catch { setError('Failed to load notifications.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(1); }, [load]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { setError('Failed to mark all as read.'); }
    finally { setMarkingAll(false); }
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60)   return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🔔</span>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>Notifications</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
              {pagination.total} total
              {unreadCount > 0 && <span style={{ marginLeft: '0.5rem', background: 'var(--color-error)', color: '#fff', borderRadius: '9999px', padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: 700 }}>{unreadCount} unread</span>}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll} disabled={markingAll} className="btn btn-secondary btn-sm">
            {markingAll ? 'Marking…' : '✓ Mark all as read'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading…</div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔕</p>
          <p style={{ color: 'var(--color-text-muted)' }}>No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
              style={{
                background: n.isRead ? '#fff' : 'var(--color-primary-subtle)',
                border: `1px solid ${n.isRead ? 'var(--color-border)' : 'var(--color-border-strong)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '0.875rem 1.125rem',
                display: 'flex',
                gap: '0.875rem',
                alignItems: 'flex-start',
                cursor: n.isRead ? 'default' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {/* Icon */}
              <div style={{
                width: 38, height: 38, borderRadius: 'var(--radius-md)', flexShrink: 0,
                background: n.isRead ? 'var(--color-off-white)' : 'var(--color-primary-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
              }}>
                {TYPE_ICONS[n.type] || '🔔'}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <p style={{ fontWeight: n.isRead ? 500 : 700, fontSize: '0.875rem', color: 'var(--color-text)', margin: 0 }}>{n.title}</p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>{fmtDate(n.createdAt)}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '0.2rem 0 0', lineHeight: 1.5 }}>{n.message}</p>
                {!n.isRead && (
                  <span style={{ display: 'inline-block', marginTop: '0.4rem', fontSize: '0.68rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                    Click to mark as read
                  </span>
                )}
              </div>

              {/* Unread dot */}
              {!n.isRead && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0, marginTop: '0.4rem' }} />
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onPage={load} />
    </div>
  );
};

export default Notifications;
