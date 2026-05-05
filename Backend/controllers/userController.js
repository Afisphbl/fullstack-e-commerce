'use strict';

const User = require('../models/userModel');
const factory = require('./handleFactory');
const catchAsync = require('../utils/catchAsync');
const userService = require('../services/userService');
const MESSAGES = require('../constants/messages');

// ── "Me" shortcuts ────────────────────────────────────────────────────────────
exports.getMe = (req, res, next) => {
  userService.setCurrentUserId(req);
  next();
};

exports.updateMe = catchAsync(async (req, res) => {
  const user = await userService.updateMe(req.user._id, req.body);
  res.status(200).json({
    status: 'success',
    message: MESSAGES.UPDATED,
    data: { user },
  });
});

exports.deleteMe = catchAsync(async (req, res) => {
  await userService.deleteMe(req.user._id);
  res.status(204).json({ status: 'success', data: null });
});

// ── Wishlist ──────────────────────────────────────────────────────────────────
exports.getWishlist = catchAsync(async (req, res) => {
  const wishlist = await userService.getWishlist(req.user._id);
  res.status(200).json({
    status: 'success',
    results: wishlist.length,
    data: { wishlist },
  });
});

exports.addToWishlist = catchAsync(async (req, res) => {
  const user = await userService.addToWishlist(req.user._id, req.body.productId);
  res.status(200).json({ status: 'success', data: { wishlist: user.wishlist } });
});

exports.removeFromWishlist = catchAsync(async (req, res) => {
  const user = await userService.removeFromWishlist(req.user._id, req.params.productId);
  res.status(200).json({ status: 'success', data: { wishlist: user.wishlist } });
});

// ── Admin CRUD — delegate to factory ──────────────────────────────────────────
exports.getAllUsers  = factory.getAll(User);
exports.getUser     = factory.getOne(User);
exports.createUser  = factory.createOne(User);   // admin only
exports.updateUser  = factory.updateOne(User);   // admin — DO NOT use for passwords
exports.deleteUser  = factory.deleteOne(User);
