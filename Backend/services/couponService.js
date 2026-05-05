'use strict';

const Coupon = require('../models/couponModel');
const AppError = require('../utils/AppError');

/**
 * Validate a coupon code without creating an order.
 * Useful for a "check coupon" endpoint before checkout.
 */
const validateCoupon = async (code, userId, orderTotal) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) throw new AppError('Invalid coupon code.', 404);

  const { ok, reason } = coupon.isApplicable(userId, orderTotal);
  if (!ok) throw new AppError(reason, 400);

  const discountAmount = coupon.computeDiscount(orderTotal);
  return {
    code: coupon.code,
    type: coupon.type,
    discount: coupon.discount,
    discountAmount: +discountAmount.toFixed(2),
    finalTotal: +(orderTotal - discountAmount).toFixed(2),
  };
};

module.exports = { validateCoupon };
