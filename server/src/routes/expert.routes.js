const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles, requireActiveStatus } = require('../middleware/role.middleware');
const {
  getDashboardStats,
  getProfile,
  updateProfile,
  changePassword,
  getConsultationRequests,
  getConsultationRequestById,
  acceptConsultation,
  rejectConsultation,
  getMyConsultations,
  getConsultationById,
  completeConsultation,
  getMyFarmers,
  getFarmerDetails,
  getDiseaseCases,
  getDiseaseCaseById,
  updateDiseaseCase,
  getCropAdviceList,
  getCropAdviceById,
  submitCropAdvice,
  updateCropAdvice,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getKnowledgeResources,
} = require('../controllers/expert.controller');

// ── Guard: every expert route requires valid JWT + expert role + active status ─
router.use(protect, authorizeRoles('expert'), requireActiveStatus);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', getDashboardStats);

// ── Profile & Settings ────────────────────────────────────────────────────────
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/profile/change-password', changePassword);

// ── Consultation Requests (pending / unassigned pool) ────────────────────────
router.get('/consultation-requests', getConsultationRequests);
router.get('/consultation-requests/:id', getConsultationRequestById);
router.patch('/consultation-requests/:id/accept', acceptConsultation);
router.patch('/consultation-requests/:id/reject', rejectConsultation);

// ── My Consultations (accepted / completed / all) ────────────────────────────
router.get('/consultations', getMyConsultations);
router.get('/consultations/:id', getConsultationById);
router.patch('/consultations/:id/complete', completeConsultation);

// ── My Farmers ────────────────────────────────────────────────────────────────
router.get('/farmers', getMyFarmers);
router.get('/farmers/:id', getFarmerDetails);

// ── Disease Cases ─────────────────────────────────────────────────────────────
router.get('/disease-cases', getDiseaseCases);
router.get('/disease-cases/:id', getDiseaseCaseById);
router.patch('/disease-cases/:id', updateDiseaseCase);

// ── Crop Advice ───────────────────────────────────────────────────────────────
router.get('/crop-advice', getCropAdviceList);
router.get('/crop-advice/:id', getCropAdviceById);
router.post('/crop-advice', submitCropAdvice);
router.patch('/crop-advice/:id', updateCropAdvice);

// ── Notifications ─────────────────────────────────────────────────────────────
router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', markAllNotificationsRead);
router.patch('/notifications/:id/read', markNotificationRead);

// ── Knowledge Resources (reuses News + Schemes content APIs) ─────────────────
router.get('/knowledge', getKnowledgeResources);

module.exports = router;
