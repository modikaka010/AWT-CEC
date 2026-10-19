const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles, requireActiveStatus } = require('../middleware/role.middleware');
const { requireFarm } = require('../middleware/farm.middleware');

const {
  getDashboardStats, getProfile, updateProfile, changePassword,
  getNotifications, markNotificationRead, markAllNotificationsRead,
} = require('../controllers/farmer.controller');

const {
  getFarms, getFarmById, createFarm, updateFarm, deleteFarm,
} = require('../controllers/Farm.controller');

const {
  getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories,
} = require('../controllers/farmerProduct.controller');

const {
  getCrops, getCropById, createCrop, updateCrop, updateCropStage, deleteCrop,
} = require('../controllers/crop.controller');

const {
  getOrders, getOrderById, updateOrderStatus, getOrderTracking, getSalesAnalytics,
} = require('../controllers/farmerOrder.controller');

const {
  getNegotiations, getNegotiationById,
  sendCounterOffer, acceptNegotiation, rejectNegotiation,
} = require('../controllers/farmerNegotiation.controller');

const {
  getMyConsultations, getConsultationById, createConsultation, cancelConsultation,
} = require('../controllers/farmerConsultation.controller');

const { uploadConsultationImages } = require('../middleware/upload.middleware');

const { getStates, searchPlaces, getWeather } = require('../controllers/weather.controller');
const { weatherLimiter } = require('../middleware/weatherLimiter.middleware');

// Reuse shared chat controller (same logic, different auth)
const { getChatUsers, getConversations, getMessages, sendMessage } = require('../controllers/chat.controller');

// ── All farmer routes require: valid JWT + role=farmer + status=active ─────────
router.use(protect, authorizeRoles('farmer'), requireActiveStatus);


// ── Farms (My Farm) ────────────────────────────────────────────────────────────
// Ownership is enforced in the controller: every query is scoped to req.user.id
router.get('/farms',        getFarms);
router.post('/farms',       createFarm);
router.get('/farms/:id',    getFarmById);
router.put('/farms/:id',    updateFarm);
router.delete('/farms/:id', deleteFarm);

// ── Crops (lifecycle) ──────────────────────────────────────────────────────────
router.get('/crops',              getCrops);
router.post('/crops',             createCrop);
router.get('/crops/:id',          getCropById);
router.put('/crops/:id',          updateCrop);
router.patch('/crops/:id/stage',  updateCropStage);
router.delete('/crops/:id',       deleteCrop);

// ── Weather advisory ───────────────────────────────────────────────────────────
router.use('/weather', weatherLimiter);          // per-farmer rate limit (after protect)
router.get('/weather/states', getStates);        // must be before /weather
router.get('/weather/places', searchPlaces);
router.get('/weather',        getWeather);

// ── Dashboard ──────────────────────────────────────────────────────────────────
// A farmer must have registered at least one farm before using the dashboard
router.get('/dashboard', requireFarm, getDashboardStats);

// ── Profile & Settings ─────────────────────────────────────────────────────────
router.get('/profile',                   getProfile);
router.patch('/profile',                 updateProfile);
router.patch('/profile/change-password', changePassword);

// ── Products ───────────────────────────────────────────────────────────────────
router.get('/products/categories',  getCategories);   // must be before /:id
router.get('/products',             getProducts);
router.post('/products',            createProduct);
router.get('/products/:id',         getProductById);
router.put('/products/:id',         updateProduct);
router.delete('/products/:id',      deleteProduct);

// ── Orders ─────────────────────────────────────────────────────────────────────
router.get('/orders',                    getOrders);
router.get('/analytics',                 getSalesAnalytics);   // before /orders/:id
router.get('/orders/:id',                getOrderById);
router.patch('/orders/:id/status',       updateOrderStatus);
router.get('/orders/:id/tracking',       getOrderTracking);

// ── Negotiations ───────────────────────────────────────────────────────────────
router.get('/negotiations',                getNegotiations);
router.get('/negotiations/:id',            getNegotiationById);
router.patch('/negotiations/:id/counter',  sendCounterOffer);
router.patch('/negotiations/:id/accept',   acceptNegotiation);
router.patch('/negotiations/:id/reject',   rejectNegotiation);

// ── Consultations ────────────────────────────────────────────────────────────
router.get('/consultations',              getMyConsultations);
router.post('/consultations',             uploadConsultationImages, createConsultation);
router.get('/consultations/:id',          getConsultationById);
router.patch('/consultations/:id/cancel', cancelConsultation);

// ── Chat (reuses same controller as buyer) ─────────────────────────────────────
router.get('/chat/users',         getChatUsers);
router.get('/chat/conversations',  getConversations);
router.get('/chat/:userId',        getMessages);
router.post('/chat/:userId',       sendMessage);

// ── Notifications ──────────────────────────────────────────────────────────────
router.get('/notifications',               getNotifications);
router.patch('/notifications/read-all',    markAllNotificationsRead);
router.patch('/notifications/:id/read',    markNotificationRead);

module.exports = router;
