'use strict';

const mongoose = require('mongoose');
const { COUPON_TYPE } = require('../constants/enums');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required.'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, 'Coupon code must be at most 20 characters.'],
    },
    type: {
      type: String,
      enum: Object.values(COUPON_TYPE),
      required: true,
    },
    discount: {
      type: Number,
      required: [true, 'Discount value is required.'],
      min: [0, 'Discount cannot be negative.'],
    },
    minOrderValue: { type: Number, default: 0 },
    maxUsage: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    usedBy: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required.'],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// code is indexed via unique:true on the field definition — no duplicate here
couponSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// ─── Instance method: validate applicability ──────────────────────────────────
couponSchema.methods.isApplicable = function (userId, orderTotal) {
  const now = new Date();
  if (!this.isActive) return { ok: false, reason: 'Coupon is inactive.' };
  if (this.expiresAt < now) return { ok: false, reason: 'Coupon has expired.' };
  if (this.usedCount >= this.maxUsage)
    return { ok: false, reason: 'Coupon usage limit reached.' };
  if (this.usedBy.map(String).includes(String(userId)))
    return { ok: false, reason: 'You have already used this coupon.' };
  if (orderTotal < this.minOrderValue)
    return {
      ok: false,
      reason: `Minimum order value for this coupon is $${this.minOrderValue}.`,
    };
  return { ok: true };
};

couponSchema.methods.computeDiscount = function (orderTotal) {
  if (this.type === COUPON_TYPE.PERCENTAGE) {
    return (orderTotal * this.discount) / 100;
  }
  return Math.min(this.discount, orderTotal);
};

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
