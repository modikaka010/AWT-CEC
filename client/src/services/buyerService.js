import api from './api';

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboardStats = () => api.get('/buyer/dashboard');

// ── Profile & Settings ────────────────────────────────────────────────────────
export const getProfile = () => api.get('/buyer/profile');
export const updateProfile = (data) => api.patch('/buyer/profile', data);
export const changePassword = (data) => api.patch('/buyer/profile/change-password', data);

// ── Marketplace ───────────────────────────────────────────────────────────────
export const getProducts = (params = {}) => api.get('/buyer/marketplace', { params });
export const getProductById = (id) => api.get(`/buyer/marketplace/${id}`);
export const getFarmers = (params = {}) => api.get('/buyer/marketplace/farmers', { params });
export const getFarmerById = (id) => api.get(`/buyer/marketplace/farmers/${id}`);

// ── Cart ──────────────────────────────────────────────────────────────────────
export const getCart = () => api.get('/buyer/cart');
export const addToCart = (productId, quantity) => api.post('/buyer/cart', { productId, quantity });
export const updateCartItem = (itemId, quantity) => api.put(`/buyer/cart/${itemId}`, { quantity });
export const removeFromCart = (itemId) => api.delete(`/buyer/cart/${itemId}`);
export const clearCart = () => api.delete('/buyer/cart');

// ── Orders ────────────────────────────────────────────────────────────────────
export const createOrder = (data) => api.post('/buyer/orders', data);
export const getOrders = (params = {}) => api.get('/buyer/orders', { params });
export const getOrderById = (id) => api.get(`/buyer/orders/${id}`);
export const cancelOrder = (id, reason) => api.patch(`/buyer/orders/${id}/cancel`, { reason });
export const getOrderTracking = (id) => api.get(`/buyer/orders/${id}/tracking`);

// ── Chat ──────────────────────────────────────────────────────────────────────
export const getChatUsers = () => api.get('/buyer/chat/users');
export const getConversations = () => api.get('/buyer/chat/conversations');
export const getMessages = (userId, params = {}) => api.get(`/buyer/chat/${userId}`, { params });
export const sendMessage = (userId, data) => api.post(`/buyer/chat/${userId}`, data);

// ── Notifications ─────────────────────────────────────────────────────────────
export const getNotifications = (params = {}) => api.get('/buyer/notifications', { params });
export const markNotificationRead = (id) => api.patch(`/buyer/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/buyer/notifications/read-all');
