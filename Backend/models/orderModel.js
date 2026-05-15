'use strict';

const mongoose = require('mongoose');
const { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } = require('../constants/enums');

// ── Embedded order-item schema ────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Order item must reference a product.'],
    },
    name: {
      type: {
        am: { type: String, required: true },
        en: { type: String, required: true },
        om: { type: String, required: true }
      },
      required: true
    },
    imageCover: String,
    price: { type: Number, required: true },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1.'],
    },
  },
  { _id: false }
);

// ── Main order schema ─────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user.'],
    },
    orderItems: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Order must have at least one item.',
      },
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: String,
      zip: { type: String, required: true },
      country: { type: String, required: true },
    },
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    itemsPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: PAYMENT_METHOD.CARD,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
    },
    paymentResult: {
      id: String,
      status: String,
      updateTime: String,
      emailAddress: String,
      method: String,
      reference: String,
    },
    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    deliveredAt: Date,
    paidAt: Date,
    coupon: { type: mongoose.Schema.ObjectId, ref: 'Coupon' },
    discount: { type: Number, default: 0 },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

// ─── Query middleware — populate user ─────────────────────────────────────────
orderSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name email' });
  next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
