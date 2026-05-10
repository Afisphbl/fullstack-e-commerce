'use strict';

const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/auth');
const ROLES = require('../constants/roles');

const router = express.Router();

// ── Public webhook endpoint (no auth required) ────────────────────────────────
router.post('/chapa/webhook', paymentController.chapaWebhook);

// ── Public callback endpoint (no auth required) ───────────────────────────────
router.get('/chapa/callback', paymentController.chapaCallback);

// ── Protected routes ──────────────────────────────────────────────────────────
router.use(protect);

// Initialize Chapa payment
router.post('/chapa/initialize', paymentController.initializeChapaPayment);

// Verify payment status
router.get('/verify/:orderId', paymentController.verifyPaymentStatus);

// Get supported currencies
router.get('/currencies', paymentController.getSupportedCurrencies);

// Get banks list
router.get('/banks', paymentController.getBanks);

// Check Chapa configuration (admin only)
router.get('/chapa/config', restrictTo(ROLES.ADMIN), paymentController.checkChapaConfig);

module.exports = router;
