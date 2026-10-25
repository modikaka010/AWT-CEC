const express = require('express');
const router = express.Router();

const authRoutes    = require('./auth.routes');
const adminRoutes   = require('./admin.routes');
const contentRoutes = require('./content.routes');
const expertRoutes  = require('./expert.routes');
const buyerRoutes   = require('./buyer.routes');
const farmerRoutes  = require('./farmer.routes');

// ── Mount routes ──────────────────────────────────────────────────────────────
router.use('/auth',    authRoutes);
router.use('/admin',   adminRoutes);
router.use('/content', contentRoutes);
router.use('/expert',  expertRoutes);
router.use('/buyer',   buyerRoutes);
router.use('/farmer',  farmerRoutes);

module.exports = router;
