'use strict';

const Feature = require('../models/featureModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * @desc    Get all active features (public)
 * @route   GET /api/v1/features
 * @access  Public
 */
exports.getAllFeatures = catchAsync(async (req, res, next) => {
  const features = await Feature.find({ isActive: true }).sort({ order: 1 });

  res.status(200).json({
    status: 'success',
    results: features.length,
    data: {
      features,
    },
  });
});

/**
 * @desc    Get all features (admin)
 * @route   GET /api/v1/features/admin
 * @access  Private/Admin
 */
exports.getAllFeaturesAdmin = catchAsync(async (req, res, next) => {
  const features = await Feature.find().sort({ order: 1 }).populate('createdBy', 'name email');

  res.status(200).json({
    status: 'success',
    results: features.length,
    data: {
      features,
    },
  });
});

/**
 * @desc    Get single feature
 * @route   GET /api/v1/features/:id
 * @access  Public
 */
exports.getFeature = catchAsync(async (req, res, next) => {
  const feature = await Feature.findById(req.params.id);

  if (!feature) {
    return next(new AppError('No feature found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      feature,
    },
  });
});

/**
 * @desc    Create feature
 * @route   POST /api/v1/features
 * @access  Private/Admin
 */
exports.createFeature = catchAsync(async (req, res, next) => {
  req.body.createdBy = req.user._id;

  const feature = await Feature.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      feature,
    },
  });
});

/**
 * @desc    Update feature
 * @route   PATCH /api/v1/features/:id
 * @access  Private/Admin
 */
exports.updateFeature = catchAsync(async (req, res, next) => {
  const feature = await Feature.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!feature) {
    return next(new AppError('No feature found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      feature,
    },
  });
});

/**
 * @desc    Delete feature
 * @route   DELETE /api/v1/features/:id
 * @access  Private/Admin
 */
exports.deleteFeature = catchAsync(async (req, res, next) => {
  const feature = await Feature.findByIdAndDelete(req.params.id);

  if (!feature) {
    return next(new AppError('No feature found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc    Reorder features
 * @route   PATCH /api/v1/features/reorder
 * @access  Private/Admin
 */
exports.reorderFeatures = catchAsync(async (req, res, next) => {
  const { features } = req.body; // Array of { id, order }

  if (!features || !Array.isArray(features)) {
    return next(new AppError('Please provide an array of features with order', 400));
  }

  // Update order for each feature
  const updatePromises = features.map((feature) =>
    Feature.findByIdAndUpdate(feature.id, { order: feature.order }, { new: true })
  );

  await Promise.all(updatePromises);

  const updatedFeatures = await Feature.find().sort({ order: 1 });

  res.status(200).json({
    status: 'success',
    data: {
      features: updatedFeatures,
    },
  });
});
