'use strict';

const express = require('express');
const couponController = require('../controllers/couponController');
const { protect, restrictTo } = require('../middleware/auth');
const ROLES = require('../constants/roles');

const router = express.Router();

router.use(protect);

// ── Any authenticated user can validate a coupon code ────────────────────────
router.post('/validate', couponController.validateCoupon);

// ── Admin CRUD ────────────────────────────────────────────────────────────────
router.use(restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.route('/')
  .get(couponController.getAllCoupons)
  .post(couponController.createCoupon);

router.route('/:id')
  .get(couponController.getCoupon)
  .patch(couponController.updateCoupon)
  .delete(couponController.deleteCoupon);

module.exports = router;
