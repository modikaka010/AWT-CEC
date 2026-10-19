import api from './api';

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboardStats = () => api.get('/farmer/dashboard');

// ─── Profile ──────────────────────────────────────────────────────────────────
export const getProfile        = () => api.get('/farmer/profile');
export const updateProfile     = (data) => api.patch('/farmer/profile', data);
export const changePassword    = (data) => api.patch('/farmer/profile/change-password', data);

// ─── Products ─────────────────────────────────────────────────────────────────
export const getCategories     = ()       => api.get('/farmer/products/categories');
export const getProducts       = (params) => api.get('/farmer/products', { params });
export const getProductById    = (id)     => api.get(`/farmer/products/${id}`);
export const createProduct     = (data)   => api.post('/farmer/products', data);
export const updateProduct     = (id, data) => api.put(`/farmer/products/${id}`, data);
export const deleteProduct     = (id)     => api.delete(`/farmer/products/${id}`);

// ─── Orders ───────────────────────────────────────────────────────────────────
export const getOrders          = (params)       => api.get('/farmer/orders', { params });
export const getOrderById       = (id)           => api.get(`/farmer/orders/${id}`);
export const updateOrderStatus  = (id, data)     => api.patch(`/farmer/orders/${id}/status`, data);
export const getOrderTracking   = (id)           => api.get(`/farmer/orders/${id}/tracking`);
export const getSalesAnalytics  = ()             => api.get('/farmer/analytics');

// ─── Negotiations ─────────────────────────────────────────────────────────────
export const getNegotiations    = (params) => api.get('/farmer/negotiations', { params });
export const getNegotiationById = (id)     => api.get(`/farmer/negotiations/${id}`);
export const sendCounterOffer   = (id, data) => api.patch(`/farmer/negotiations/${id}/counter`, data);
export const acceptNegotiation  = (id)     => api.patch(`/farmer/negotiations/${id}/accept`);
export const rejectNegotiation  = (id, data) => api.patch(`/farmer/negotiations/${id}/reject`, data);

// ─── Chat ─────────────────────────────────────────────────────────────────────
export const getChatUsers      = ()           => api.get('/farmer/chat/users');
export const getConversations  = ()           => api.get('/farmer/chat/conversations');
export const getMessages       = (userId, params) => api.get(`/farmer/chat/${userId}`, { params });
export const sendMessage       = (userId, data)   => api.post(`/farmer/chat/${userId}`, data);

// ─── Notifications ────────────────────────────────────────────────────────────
export const getNotifications         = (params) => api.get('/farmer/notifications', { params });
export const markNotificationRead     = (id)     => api.patch(`/farmer/notifications/${id}/read`);
export const markAllNotificationsRead = ()       => api.patch('/farmer/notifications/read-all');

// ─── Farms (My Farm) ──────────────────────────────────────────────────────────
export const getFarms    = ()         => api.get('/farmer/farms');
export const getFarmById = (id)       => api.get(`/farmer/farms/${id}`);
export const createFarm  = (data)     => api.post('/farmer/farms', data);
export const updateFarm  = (id, data) => api.put(`/farmer/farms/${id}`, data);
export const deleteFarm  = (id)       => api.delete(`/farmer/farms/${id}`);

// ─── Crops (lifecycle) ────────────────────────────────────────────────────────
export const getCrops         = (params)     => api.get('/farmer/crops', { params });
export const getCropById      = (id)         => api.get(`/farmer/crops/${id}`);
export const createCrop       = (data)       => api.post('/farmer/crops', data);
export const updateCrop       = (id, data)   => api.put(`/farmer/crops/${id}`, data);
export const updateCropStage  = (id, data)   => api.patch(`/farmer/crops/${id}/stage`, data);
export const deleteCrop       = (id)         => api.delete(`/farmer/crops/${id}`);

// ─── Weather advisory ─────────────────────────────────────────────────────────
export const getWeather         = (params) => api.get('/farmer/weather', { params });         // no params → profile location
export const getWeatherStates   = ()       => api.get('/farmer/weather/states');
export const searchWeatherPlaces = (params) => api.get('/farmer/weather/places', { params }); // { q, state }

// ─── Expert Advisory (consultations) ──────────────────────────────────────────
export const getConsultations   = (params) => api.get('/farmer/consultations', { params });
export const getConsultation    = (id)     => api.get(`/farmer/consultations/${id}`);
// `formData` is a FormData (fields + up to 4 files under "images").
// Content-Type is cleared so the browser sets the multipart boundary itself.
export const createConsultation = (formData) =>
  api.post('/farmer/consultations', formData, { headers: { 'Content-Type': undefined }, timeout: 60000 });
export const cancelConsultation = (id, reason) => api.patch(`/farmer/consultations/${id}/cancel`, { reason });