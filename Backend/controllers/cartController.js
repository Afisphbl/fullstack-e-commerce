'use strict';

const catchAsync = require('../utils/catchAsync');
const cartService = require('../services/cartService');

// ── Get my cart ───────────────────────────────────────────────────────────────
exports.getMyCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);
  res.status(200).json({ status: 'success', data: { cart } });
});

// ── Add item ──────────────────────────────────────────────────────────────────
exports.addItem = catchAsync(async (req, res) => {
  const cart = await cartService.addItem(req.user._id, {
    productId: req.body.productId,
    quantity: req.body.quantity,
  });
  res.status(200).json({ status: 'success', data: { cart } });
});

// ── Update item quantity ──────────────────────────────────────────────────────
exports.updateItem = catchAsync(async (req, res) => {
  const cart = await cartService.updateItem(
    req.user._id,
    req.params.productId,
    Number(req.body.quantity)
  );
  res.status(200).json({ status: 'success', data: { cart } });
});

// ── Remove item ───────────────────────────────────────────────────────────────
exports.removeItem = catchAsync(async (req, res) => {
  const cart = await cartService.removeItem(req.user._id, req.params.productId);
  res.status(200).json({ status: 'success', data: { cart } });
});

// ── Clear cart ────────────────────────────────────────────────────────────────
exports.clearCart = catchAsync(async (req, res) => {
  await cartService.clearCart(req.user._id);
  res.status(204).json({ status: 'success', data: null });
});

// ── Apply coupon ──────────────────────────────────────────────────────────────
exports.applyCoupon = catchAsync(async (req, res) => {
  const cart = await cartService.applyCoupon(req.user._id, req.body.code);
  res.status(200).json({ status: 'success', data: { cart } });
});

// ── Remove coupon ─────────────────────────────────────────────────────────────
exports.removeCoupon = catchAsync(async (req, res) => {
  const cart = await cartService.removeCoupon(req.user._id);
  res.status(200).json({ status: 'success', data: { cart } });
});
