'use strict';

const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const { protect, restrictTo } = require('../middleware/auth');
const ROLES = require('../constants/roles');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(restrictTo(ROLES.ADMIN));

// ── Analytics ─────────────────────────────────────────────────────────────────
router.get('/analytics', wishlistController.getWishlistAnalytics);

module.exports = router;
