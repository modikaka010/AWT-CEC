import api from './api';

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboardStats = () => api.get('/expert/dashboard');

// ── Profile & Settings ────────────────────────────────────────────────────────
export const getProfile = () => api.get('/expert/profile');
export const updateProfile = (data) => api.patch('/expert/profile', data);
export const changePassword = (data) => api.patch('/expert/profile/change-password', data);

// ── Consultation Requests ─────────────────────────────────────────────────────
export const getConsultationRequests = (params = {}) =>
  api.get('/expert/consultation-requests', { params });
export const getConsultationRequestById = (id) =>
  api.get(`/expert/consultation-requests/${id}`);
export const acceptConsultation = (id) =>
  api.patch(`/expert/consultation-requests/${id}/accept`);
export const rejectConsultation = (id, reason) =>
  api.patch(`/expert/consultation-requests/${id}/reject`, { reason });

// ── My Consultations ──────────────────────────────────────────────────────────
export const getMyConsultations = (params = {}) =>
  api.get('/expert/consultations', { params });
export const getConsultationById = (id) =>
  api.get(`/expert/consultations/${id}`);
export const completeConsultation = (id, data) =>
  api.patch(`/expert/consultations/${id}/complete`, data);

// ── My Farmers ────────────────────────────────────────────────────────────────
export const getMyFarmers = (params = {}) =>
  api.get('/expert/farmers', { params });
export const getFarmerDetails = (id) =>
  api.get(`/expert/farmers/${id}`);

// ── Disease Cases ─────────────────────────────────────────────────────────────
export const getDiseaseCases = (params = {}) =>
  api.get('/expert/disease-cases', { params });
export const getDiseaseCaseById = (id) =>
  api.get(`/expert/disease-cases/${id}`);
export const updateDiseaseCase = (id, data) =>
  api.patch(`/expert/disease-cases/${id}`, data);

// ── Crop Advice ───────────────────────────────────────────────────────────────
export const getCropAdviceList = (params = {}) =>
  api.get('/expert/crop-advice', { params });
export const getCropAdviceById = (id) =>
  api.get(`/expert/crop-advice/${id}`);
export const submitCropAdvice = (data) =>
  api.post('/expert/crop-advice', data);
export const updateCropAdvice = (id, data) =>
  api.patch(`/expert/crop-advice/${id}`, data);

// ── Notifications ─────────────────────────────────────────────────────────────
export const getNotifications = (params = {}) =>
  api.get('/expert/notifications', { params });
export const markNotificationRead = (id) =>
  api.patch(`/expert/notifications/${id}/read`);
export const markAllNotificationsRead = () =>
  api.patch('/expert/notifications/read-all');

// ── Knowledge Resources ───────────────────────────────────────────────────────
export const getKnowledgeResources = (params = {}) =>
  api.get('/expert/knowledge', { params });
