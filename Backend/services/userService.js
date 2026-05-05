'use strict';

const User = require('../models/userModel');
const AppError = require('../utils/AppError');

// ─── getMe — inject current user id into params ───────────────────────────────
const setCurrentUserId = (req) => {
  req.params.id = req.user._id.toString();
};

// ─── updateMe — safe profile update (no password, no role) ───────────────────
const updateMe = async (userId, body) => {
  // Filter out sensitive fields
  const allowed = ['name', 'email', 'photo', 'addresses'];
  const filtered = {};
  allowed.forEach((key) => {
    if (body[key] !== undefined) filtered[key] = body[key];
  });

  const user = await User.findByIdAndUpdate(userId, filtered, {
    new: true,
    runValidators: true,
  });
  return user;
};

// ─── deleteMe — soft delete ───────────────────────────────────────────────────
const deleteMe = async (userId) => {
  await User.findByIdAndUpdate(userId, { active: false });
};

// ─── addToWishlist ────────────────────────────────────────────────────────────
const addToWishlist = async (userId, productId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { wishlist: productId } },
    { new: true }
  ).select('wishlist');
  return user;
};

// ─── removeFromWishlist ───────────────────────────────────────────────────────
const removeFromWishlist = async (userId, productId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { wishlist: productId } },
    { new: true }
  ).select('wishlist');
  return user;
};

// ─── getWishlist ──────────────────────────────────────────────────────────────
const getWishlist = async (userId) => {
  const user = await User.findById(userId)
    .select('wishlist')
    .populate({ path: 'wishlist', select: 'name price imageCover ratingsAverage' });
  return user.wishlist;
};

module.exports = {
  setCurrentUserId,
  updateMe,
  deleteMe,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};
