'use strict';

const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createOrderRules } = require('../validators/orderValidator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.use(protect);

// ── User: create & view own orders ────────────────────────────────────────────
router.route('/')
  .get(orderController.setUserFilter, orderController.getAllOrders)
  .post(createOrderRules, validate, orderController.createOrder);

router.get('/:id', orderController.getOrder);

// ── Admin / Manager ───────────────────────────────────────────────────────────
router.use(restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF, ROLES.SUPER_ADMIN));

router.get('/stats/overview', orderController.getOrderStats);
router.patch('/:id/deliver', orderController.markDelivered);
router.patch('/:id/pay',     orderController.markPaid);
router.patch('/:id',         orderController.updateOrder);
router.delete('/:id',        restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN), orderController.deleteOrder);

module.exports = router;
