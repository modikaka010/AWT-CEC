import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNews, updateNewsStatus, deleteNews } from '../../../services/adminService';
import AdminTable from '../../../components/admin/AdminTable';
import StatusBadge from '../../../components/admin/StatusBadge';
import ConfirmModal from '../../../components/admin/ConfirmModal';
import Pagination from '../../../components/admin/Pagination';

const NEWS_CATEGORIES = [
  '', 'Crop Science', 'Market Prices', 'Government Policy',
  'Technology', 'Weather', 'Organic Farming', 'Livestock', 'General',
];

const STATUS_TABS = [
  { value: '',          label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft',     label: 'Draft' },
  { value: 'hidden',    label: 'Hidden' },
];

const NewsManagement = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, item: null, action: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError('');
    try {
      const res = await getNews({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        search: search || undefined,
        page, limit: 15,
      });
      setNews(res.data.data.news);
      setPagination(res.data.data.pagination);
    } catch { setError('Failed to load news.'); }
    finally { setLoading(false); }
  }, [statusFilter, categoryFilter, search]);

  useEffect(() => { load(1); }, [load]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput.trim()); };

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (modal.action === 'hide') {
        await deleteNews(modal.item._id);
        setSuccessMsg('Article hidden.');
      } else {
        await updateNewsStatus(modal.item._id, modal.action);
        setSuccessMsg(`Article ${modal.action}.`);
      }
      setTimeout(() => setSuccessMsg(''), 3000);
      setModal({ open: false, item: null, action: '' });
      load(pagination.page);
    } catch (e) {
      setError(e.response?.data?.message || 'Action failed.');
      setModal({ open: false, item: null, action: '' });
    } finally { setActionLoading(false); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const columns = [
    {
      key: 'title', label: 'Title',
      render: (v, row) => (
        <div>
          <p style={{ fontWeight: 600, fontSize: '0.82rem', margin: 0, color: 'var(--color-text)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>{row.category} · {row.source}</p>
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'publishedDate', label: 'Date', render: (v) => fmtDate(v) },
    { key: 'createdBy', label: 'Author', render: (v) => v?.name || '—' },
    {
      key: '_id', label: 'Actions',
      render: (id, row) => (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(`/admin/content/news/edit/${id}`)} className="btn btn-secondary btn-sm">Edit</button>
          {row.status !== 'published' && (
            <button onClick={() => setModal({ open: true, item: row, action: 'published' })} className="btn btn-sm" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid #b2dfb2' }}>Publish</button>
          )}
          {row.status === 'published' && (
            <button onClick={() => setModal({ open: true, item: row, action: 'draft' })} className="btn btn-sm" style={{ background: '#fef9ec', color: '#d4850a', border: '1px solid #fde68a' }}>Unpublish</button>
          )}
          {row.status !== 'hidden' && (
            <button onClick={() => setModal({ open: true, item: row, action: 'hide' })} className="btn btn-sm" style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)', border: '1px solid #f5c6c3' }}>Hide</button>
          )}
        </div>
      ),
    },
  ];

  const modalConfig = {
    published: { title: 'Publish Article', msg: 'Publish this article? It will be visible on the platform.', label: 'Publish', danger: false },
    draft:     { title: 'Unpublish Article', msg: 'Move this article back to draft? It will be hidden from users.', label: 'Unpublish', danger: false },
    hide:      { title: 'Hide Article', msg: 'Hide this article permanently? It will not be visible to users.', label: 'Hide', danger: true },
  };
  const cfg = modalConfig[modal.action] || {};

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📰</span>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>News Management</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>{pagination.total} articles</p>
          </div>
        </div>
        <button onClick={() => navigate('/admin/content/news/new')} className="btn btn-primary btn-sm">+ Add Article</button>
      </div>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {STATUS_TABS.map((tab) => (
          <button key={tab.value} onClick={() => setStatusFilter(tab.value)} style={{ padding: '0.35rem 0.875rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 600, border: `2px solid ${statusFilter === tab.value ? 'var(--color-primary)' : 'var(--color-border)'}`, background: statusFilter === tab.value ? 'var(--color-primary)' : '#fff', color: statusFilter === tab.value ? '#fff' : 'var(--color-text-secondary)', cursor: 'pointer', transition: 'all 0.15s' }}>{tab.label}</button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: 200 }}>
          <input className="form-input" style={{ flex: 1 }} placeholder="Search articles…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
          {search && <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setSearchInput(''); }}>Clear</button>}
        </form>
        <select className="form-input" style={{ width: 'auto', minWidth: 160 }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {NEWS_CATEGORIES.map((c) => <option key={c} value={c}>{c || 'All Categories'}</option>)}
        </select>
      </div>

      <AdminTable columns={columns} data={news} loading={loading} emptyText="No articles found." />
      <Pagination page={pagination.page} pages={pagination.pages} onPage={load} />

      <ConfirmModal isOpen={modal.open} title={cfg.title} message={`"${modal.item?.title}" — ${cfg.msg}`} confirmLabel={cfg.label} danger={cfg.danger} onConfirm={handleAction} onCancel={() => setModal({ open: false, item: null, action: '' })} loading={actionLoading} />
    </div>
  );
};

export default NewsManagement;
