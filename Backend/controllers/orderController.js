'use strict';

const Order = require('../models/orderModel');
const factory = require('./handleFactory');
const catchAsync = require('../utils/catchAsync');
const orderService = require('../services/orderService');
const AppError = require('../utils/AppError');
const ROLES = require('../constants/roles');

// ── Create order ──────────────────────────────────────────────────────────────
exports.createOrder = catchAsync(async (req, res, next) => {
  const order = await orderService.buildOrder(req.user._id, req.body, next);
  res.status(201).json({ status: 'success', data: { order } });
});

// ── My orders filter ──────────────────────────────────────────────────────────
exports.setUserFilter = (req, _res, next) => {
  // Non-admins can only see their own orders
  if (req.user.role === ROLES.USER) req.filterObj = { user: req.user._id };
  next();
};

// ── Mark delivered ────────────────────────────────────────────────────────────
exports.markDelivered = catchAsync(async (req, res, next) => {
  const order = await orderService.markDelivered(req.params.id, next);
  res.status(200).json({ status: 'success', data: { order } });
});

// ── Mark paid ─────────────────────────────────────────────────────────────────
exports.markPaid = catchAsync(async (req, res) => {
  const order = await orderService.markPaid(req.params.id, req.body.paymentResult);
  res.status(200).json({ status: 'success', data: { order } });
});

// ── Order statistics ──────────────────────────────────────────────────────────
exports.getOrderStats = catchAsync(async (req, res) => {
  const stats = await orderService.getOrderStats();
  res.status(200).json({ status: 'success', data: { stats } });
});

// ── Factory CRUD (admins) ─────────────────────────────────────────────────────
exports.getAllOrders = factory.getAll(Order);
exports.getOrder    = factory.getOne(Order);
exports.updateOrder = factory.updateOne(Order);
exports.deleteOrder = factory.deleteOne(Order);
