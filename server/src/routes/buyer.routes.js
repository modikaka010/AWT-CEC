const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles, requireActiveStatus } = require('../middleware/role.middleware');

const {
  getDashboardStats, getProfile, updateProfile, changePassword,
  getNotifications, markNotificationRead, markAllNotificationsRead,
} = require('../controllers/buyer.controller');

const {
  getMarketplaceProducts, getProductById, getMarketplaceFarmers, getFarmerById,
} = require('../controllers/marketplace.controller');

const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cart.controller');

const { createOrder, getOrders, getOrderById, cancelOrder, getOrderTracking } = require('../controllers/order.controller');

const {
  createNegotiation, getNegotiations, getNegotiationById,
  sendCounterOffer, acceptNegotiation, rejectNegotiation, cancelNegotiation,
} = require('../controllers/negotiation.controller');

const { getChatUsers, getConversations, getMessages, sendMessage } = require('../controllers/chat.controller');

// ── All buyer routes require: valid JWT + role=buyer + status=active ──────────
router.use(protect, authorizeRoles('buyer'), requireActiveStatus);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', getDashboardStats);

// ── Profile & Settings ────────────────────────────────────────────────────────
router.get('/profile',                   getProfile);
router.patch('/profile',                 updateProfile);
router.patch('/profile/change-password', changePassword);

// ── Marketplace ───────────────────────────────────────────────────────────────
router.get('/marketplace',               getMarketplaceProducts);
router.get('/marketplace/farmers',       getMarketplaceFarmers);
router.get('/marketplace/farmers/:id',   getFarmerById);
router.get('/marketplace/:id',           getProductById);

// ── Cart ──────────────────────────────────────────────────────────────────────
router.get('/cart',             getCart);
router.post('/cart',            addToCart);
router.put('/cart/:itemId',     updateCartItem);
router.delete('/cart/:itemId',  removeFromCart);
router.delete('/cart',          clearCart);

// ── Orders ────────────────────────────────────────────────────────────────────
router.post('/orders',                   createOrder);
router.get('/orders',                    getOrders);
router.get('/orders/:id',                getOrderById);
router.patch('/orders/:id/cancel',       cancelOrder);
router.get('/orders/:id/tracking',       getOrderTracking);

// ── Chat ──────────────────────────────────────────────────────────────────────
router.get('/chat/users',         getChatUsers);
router.get('/chat/conversations',  getConversations);
router.get('/chat/:userId',        getMessages);
router.post('/chat/:userId',       sendMessage);

// ── Notifications ─────────────────────────────────────────────────────────────
router.get('/notifications',                  getNotifications);
router.patch('/notifications/read-all',       markAllNotificationsRead);
router.patch('/notifications/:id/read',       markNotificationRead);

module.exports = router;
