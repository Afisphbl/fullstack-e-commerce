'use strict';

const Review = require('../models/reviewModel');
const factory = require('./handleFactory');
const reviewService = require('../services/reviewService');

// ── Nested-route helpers (used as middleware in the router) ───────────────────
exports.setProductAndUser = reviewService.setProductAndUser;
exports.setProductFilter  = reviewService.setProductFilter;

// ── Factory CRUD ──────────────────────────────────────────────────────────────
exports.getAllReviews  = factory.getAll(Review);
exports.getReview     = factory.getOne(Review);
exports.createReview  = factory.createOne(Review);
exports.updateReview  = factory.updateOne(Review);
exports.deleteReview  = factory.deleteOne(Review);
