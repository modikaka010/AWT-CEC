import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, updateUserStatus } from '../../../services/adminService';
import AdminTable from '../../../components/admin/AdminTable';
import StatusBadge from '../../../components/admin/StatusBadge';
import ConfirmModal from '../../../components/admin/ConfirmModal';
import Pagination from '../../../components/admin/Pagination';

/**
 * Generic user list shared by Farmers, Buyers, Experts pages.
 * Props: role ('farmer' | 'buyer' | 'expert'), title, icon
 */
const UsersList = ({ role, title, icon }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ open: false, user: null, newStatus: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await getUsers({ role, status: statusFilter || undefined, search: search || undefined, page, limit: 15 });
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [role, search, statusFilter]);

  useEffect(() => { load(1); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const openModal = (user, newStatus) => setModal({ open: true, user, newStatus });
  const closeModal = () => setModal({ open: false, user: null, newStatus: '' });

  const confirmStatusChange = async () => {
    setActionLoading(true);
    try {
      await updateUserStatus(modal.user._id, modal.newStatus);
      setSuccessMsg(`${modal.user.name} has been ${modal.newStatus === 'active' ? 'activated' : 'suspended'}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      closeModal();
      load(pagination.page);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update status.');
      closeModal();
    } finally {
      setActionLoading(false);
    }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const STATUS_OPTIONS = role === 'expert'
    ? ['', 'active', 'pending', 'rejected', 'suspended']
    : ['', 'active', 'suspended'];

  const columns = [
    {
      key: 'name', label: 'Name',
      render: (v, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
            {v?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.8rem', margin: 0, color: 'var(--color-text)' }}>{v}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'loginId', label: 'Login ID', render: (v) => <code style={{ fontSize: '0.75rem', background: 'var(--color-off-white)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>{v || '—'}</code> },
    { key: 'mobile', label: 'Mobile', render: (v) => v || '—' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'createdAt', label: 'Joined', render: (v) => fmtDate(v) },
    {
      key: '_id', label: 'Actions',
      render: (id, row) => (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(`/admin/users/${id}`)} className="btn btn-secondary btn-sm">View</button>
          {row.status === 'active' && (
            <button onClick={() => openModal(row, 'suspended')} className="btn btn-sm" style={{ background: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80' }}>Suspend</button>
          )}
          {(row.status === 'suspended') && (
            <button onClick={() => openModal(row, 'active')} className="btn btn-sm" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid #b2dfb2' }}>Activate</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0, color: 'var(--color-text)' }}>{title}</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>{pagination.total} total</p>
        </div>
      </div>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: 220 }}>
          <input
            className="form-input"
            style={{ flex: 1 }}
            placeholder={`Search ${title.toLowerCase()}…`}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
          {search && <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setSearchInput(''); }}>Clear</button>}
        </form>
        <select
          className="form-input"
          style={{ width: 'auto', minWidth: 140 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>
          ))}
        </select>
      </div>

      <AdminTable columns={columns} data={users} loading={loading} emptyText={`No ${title.toLowerCase()} found.`} />
      <Pagination page={pagination.page} pages={pagination.pages} onPage={(p) => load(p)} />

      <ConfirmModal
        isOpen={modal.open}
        title={modal.newStatus === 'active' ? 'Activate User' : 'Suspend User'}
        message={
          modal.newStatus === 'active'
            ? `Activate ${modal.user?.name}? They will be able to log in again.`
            : `Suspend ${modal.user?.name}? They will not be able to log in.`
        }
        confirmLabel={modal.newStatus === 'active' ? 'Activate' : 'Suspend'}
        danger={modal.newStatus === 'suspended'}
        onConfirm={confirmStatusChange}
        onCancel={closeModal}
        loading={actionLoading}
      />
    </div>
  );
};

export default UsersList;
