'use strict';

const mongoose = require('mongoose');

// ── Embedded cart-item schema ──────────────────────────────────────────────────
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Cart item must reference a product.'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1.'],
      default: 1,
    },
    price: { type: Number, required: true }, // snapshot at time of add
    name: { type: String, required: true },
    imageCover: String,
  },
  { _id: false }
);

// ── Main cart schema ───────────────────────────────────────────────────────────
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one cart per user
      index: true,
    },
    items: { type: [cartItemSchema], default: [] },
    // Coupon applied to cart (pre-checkout)
    coupon: { type: mongoose.Schema.ObjectId, ref: 'Coupon', default: null },
    discount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtuals ──────────────────────────────────────────────────────────────────
cartSchema.virtual('subtotal').get(function () {
  return +this.items
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);
});

cartSchema.virtual('total').get(function () {
  return +(this.subtotal - this.discount).toFixed(2);
});

cartSchema.virtual('itemCount').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
