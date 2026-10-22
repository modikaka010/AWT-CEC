import api from './api';

// ── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboardStats = () => api.get('/admin/dashboard');

// ── Analytics ────────────────────────────────────────────────────────────────
export const getAnalytics = (params = {}) => api.get('/admin/analytics', { params });
export const getAdvisories = (params = {}) => api.get('/admin/advisories', { params });

// ── Users ────────────────────────────────────────────────────────────────────
export const getUsers = (params = {}) => api.get('/admin/users', { params });
export const getUserById = (id) => api.get(`/admin/users/${id}`);
export const updateUserStatus = (id, status) => api.patch(`/admin/users/${id}/status`, { status });

// ── Expert Verification ──────────────────────────────────────────────────────
export const getExpertRequests = (params = {}) => api.get('/admin/experts/requests', { params });
export const getExpertRequestById = (id) => api.get(`/admin/experts/requests/${id}`);
export const approveExpert = (id) => api.patch(`/admin/experts/requests/${id}/approve`);
export const rejectExpert = (id, reason) => api.patch(`/admin/experts/requests/${id}/reject`, { reason });

// ── Products ─────────────────────────────────────────────────────────────────
export const getProducts = (params = {}) => api.get('/admin/products', { params });
export const getProductById = (id) => api.get(`/admin/products/${id}`);
export const hideProduct = (id, reason) => api.patch(`/admin/products/${id}/hide`, { reason });
export const restoreProduct = (id) => api.patch(`/admin/products/${id}/restore`);

// ── Orders ───────────────────────────────────────────────────────────────────
export const getOrders = (params = {}) => api.get('/admin/orders', { params });
export const getOrderById = (id) => api.get(`/admin/orders/${id}`);

// ── Reports ──────────────────────────────────────────────────────────────────
export const getReports = (params = {}) => api.get('/admin/reports', { params });
export const getReportById = (id) => api.get(`/admin/reports/${id}`);
export const updateReportStatus = (id, status, resolutionNote) =>
  api.patch(`/admin/reports/${id}/status`, { status, resolutionNote });

// ── Notifications ────────────────────────────────────────────────────────────
export const getNotifications = (params = {}) => api.get('/admin/notifications', { params });
export const markNotificationRead = (id) => api.patch(`/admin/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/admin/notifications/read-all');

// ── Profile & Settings ───────────────────────────────────────────────────────
export const getAdminProfile = () => api.get('/admin/profile');
export const updateAdminProfile = (data) => api.patch('/admin/profile', data);
export const changeAdminPassword = (data) => api.patch('/admin/profile/change-password', data);

// ── Content — News ───────────────────────────────────────────────────────────
export const getNews = (params = {}) => api.get('/content/news', { params });
export const getNewsById = (id) => api.get(`/content/news/${id}`);
export const createNews = (data) => api.post('/content/news', data);
export const updateNews = (id, data) => api.patch(`/content/news/${id}`, data);
export const updateNewsStatus = (id, status) => api.patch(`/content/news/${id}/status`, { status });
export const deleteNews = (id) => api.delete(`/content/news/${id}`);

// ── Content — Schemes ────────────────────────────────────────────────────────
export const getSchemes = (params = {}) => api.get('/content/schemes', { params });
export const getSchemeById = (id) => api.get(`/content/schemes/${id}`);
export const createScheme = (data) => api.post('/content/schemes', data);
export const updateScheme = (id, data) => api.patch(`/content/schemes/${id}`, data);
export const updateSchemeStatus = (id, status) => api.patch(`/content/schemes/${id}/status`, { status });
export const deleteScheme = (id) => api.delete(`/content/schemes/${id}`);
