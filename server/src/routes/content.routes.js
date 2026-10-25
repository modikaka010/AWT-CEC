const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles, requireActiveStatus } = require('../middleware/role.middleware');
const {
  getNews, getNewsById, createNews, updateNews, updateNewsStatus, deleteNews,
  getSchemes, getSchemeById, createScheme, updateScheme, updateSchemeStatus, deleteScheme,
} = require('../controllers/content.controller');

// ── Admin-only guard ──────────────────────────────────────────────────────────
const adminOnly = [protect, authorizeRoles('admin'), requireActiveStatus];

// ── NEWS ──────────────────────────────────────────────────────────────────────
// Public read — no auth required for published news (used by landing page)
router.get('/news',     getNews);
router.get('/news/:id', getNewsById);

// Admin write operations
router.post('/news',                ...adminOnly, createNews);
router.patch('/news/:id',           ...adminOnly, updateNews);
router.patch('/news/:id/status',    ...adminOnly, updateNewsStatus);
router.delete('/news/:id',          ...adminOnly, deleteNews);

// ── SCHEMES ───────────────────────────────────────────────────────────────────
// Public read — no auth required for published schemes
router.get('/schemes',     getSchemes);
router.get('/schemes/:id', getSchemeById);

// Admin write operations
router.post('/schemes',              ...adminOnly, createScheme);
router.patch('/schemes/:id',         ...adminOnly, updateScheme);
router.patch('/schemes/:id/status',  ...adminOnly, updateSchemeStatus);
router.delete('/schemes/:id',        ...adminOnly, deleteScheme);

module.exports = router;
