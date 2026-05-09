'use strict';

const Review = require('../models/reviewModel');
const factory = require('./handleFactory');
const reviewService = require('../services/reviewService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const MESSAGES = require('../constants/messages');
const ROLES = require('../constants/roles');

// ── Nested-route helpers (used as middleware in the router) ───────────────────
exports.setProductAndUser = reviewService.setProductAndUser;
exports.setProductFilter  = reviewService.setProductFilter;

// ── Factory CRUD ──────────────────────────────────────────────────────────────
exports.getAllReviews  = factory.getAll(Review);
exports.getReview     = factory.getOne(Review);
exports.createReview  = factory.createOne(Review);

// ── Update review (with ownership check) ──────────────────────────────────────
exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError(MESSAGES.NOT_FOUND, 404));

  // Only the review owner or admin can update
  if (req.user.role !== ROLES.ADMIN && review.user._id.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only update your own reviews', 403));
  }

  // Update allowed fields
  const allowedFields = ['review', 'rating'];
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      review[field] = req.body[field];
    }
  });

  await review.save();

  res.status(200).json({
    status: 'success',
    message: MESSAGES.UPDATED,
    data: { data: review },
  });
});

// ── Delete review (with ownership check) ──────────────────────────────────────
exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError(MESSAGES.NOT_FOUND, 404));

  // Only the review owner or admin can delete
  if (req.user.role !== ROLES.ADMIN && review.user._id.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only delete your own reviews', 403));
  }

  await review.deleteOne();

  res.status(204).json({ status: 'success', data: null });
});
