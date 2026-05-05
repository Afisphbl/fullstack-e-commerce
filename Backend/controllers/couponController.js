'use strict';

const Coupon = require('../models/couponModel');
const factory = require('./handleFactory');
const catchAsync = require('../utils/catchAsync');
const couponService = require('../services/couponService');

// ── Validate coupon (pre-checkout) ────────────────────────────────────────────
exports.validateCoupon = catchAsync(async (req, res) => {
  const result = await couponService.validateCoupon(
    req.body.code,
    req.user._id,
    req.body.orderTotal
  );
  res.status(200).json({ status: 'success', data: result });
});

// ── Factory CRUD (admin only) ─────────────────────────────────────────────────
exports.getAllCoupons  = factory.getAll(Coupon);
exports.getCoupon     = factory.getOne(Coupon);
exports.createCoupon  = factory.createOne(Coupon);
exports.updateCoupon  = factory.updateOne(Coupon);
exports.deleteCoupon  = factory.deleteOne(Coupon);
