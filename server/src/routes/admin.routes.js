const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles, requireActiveStatus } = require('../middleware/role.middleware');
const {
  getDashboardStats,
  getAnalytics,
  getUsers,
  getUserById,
  updateUserStatus,
  getExpertRequests,
  getExpertRequestById,
  approveExpert,
  rejectExpert,
  getProducts,
  getProductById,
  hideProduct,
  restoreProduct,
  getOrders,
  getOrderById,
  getReports,
  getReportById,
  updateReportStatus,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getAdvisories,
} = require('../controllers/admin.controller');

// ── Guard: every admin route requires valid JWT + admin role + active status ──
router.use(protect, authorizeRoles('admin'), requireActiveStatus);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', getDashboardStats);

// ── Analytics ─────────────────────────────────────────────────────────────────
router.get('/analytics', getAnalytics);

// ── Expert Consultations & Advice ────────────────────────────────────────────
router.get('/advisories', getAdvisories);

// ── User Management ───────────────────────────────────────────────────────────
router.get('/users',          getUsers);
router.get('/users/:id',      getUserById);
router.patch('/users/:id/status', updateUserStatus);

// ── Expert Verification ───────────────────────────────────────────────────────
router.get('/experts/requests',         getExpertRequests);
router.get('/experts/requests/:id',     getExpertRequestById);
router.patch('/experts/requests/:id/approve', approveExpert);
router.patch('/experts/requests/:id/reject',  rejectExpert);

// ── Product Management ────────────────────────────────────────────────────────
router.get('/products',            getProducts);
router.get('/products/:id',        getProductById);
router.patch('/products/:id/hide',    hideProduct);
router.patch('/products/:id/restore', restoreProduct);

// ── Order Monitoring ──────────────────────────────────────────────────────────
router.get('/orders',       getOrders);
router.get('/orders/:id',   getOrderById);

// ── Reports & Complaints ──────────────────────────────────────────────────────
router.get('/reports',            getReports);
router.get('/reports/:id',        getReportById);
router.patch('/reports/:id/status', updateReportStatus);

// ── Notifications ─────────────────────────────────────────────────────────────
router.get('/notifications',                      getNotifications);
router.patch('/notifications/read-all',           markAllNotificationsRead);
router.patch('/notifications/:id/read',           markNotificationRead);

// ── Admin Profile & Settings ──────────────────────────────────────────────────
router.get('/profile',                   getAdminProfile);
router.patch('/profile',                 updateAdminProfile);
router.patch('/profile/change-password', changeAdminPassword);

module.exports = router;
