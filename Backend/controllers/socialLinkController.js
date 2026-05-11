'use strict';

const SocialLink = require('../models/socialLinkModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * @desc    Get all active social links (public)
 * @route   GET /api/v1/social-links
 * @access  Public
 */
exports.getAllLinks = catchAsync(async (req, res, next) => {
  const links = await SocialLink.find({ isActive: true }).sort({ order: 1 });

  res.status(200).json({
    status: 'success',
    results: links.length,
    data: {
      links,
    },
  });
});

/**
 * @desc    Get all social links (admin)
 * @route   GET /api/v1/social-links/admin
 * @access  Private/Admin
 */
exports.getAllLinksAdmin = catchAsync(async (req, res, next) => {
  const links = await SocialLink.find().sort({ order: 1 });

  res.status(200).json({
    status: 'success',
    results: links.length,
    data: {
      links,
    },
  });
});

/**
 * @desc    Get single social link
 * @route   GET /api/v1/social-links/:id
 * @access  Public
 */
exports.getLink = catchAsync(async (req, res, next) => {
  const link = await SocialLink.findById(req.params.id);

  if (!link) {
    return next(new AppError('No social link found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      link,
    },
  });
});

/**
 * @desc    Create social link
 * @route   POST /api/v1/social-links
 * @access  Private/Admin
 */
exports.createLink = catchAsync(async (req, res, next) => {
  const link = await SocialLink.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      link,
    },
  });
});

/**
 * @desc    Update social link
 * @route   PATCH /api/v1/social-links/:id
 * @access  Private/Admin
 */
exports.updateLink = catchAsync(async (req, res, next) => {
  const link = await SocialLink.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!link) {
    return next(new AppError('No social link found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      link,
    },
  });
});

/**
 * @desc    Delete social link
 * @route   DELETE /api/v1/social-links/:id
 * @access  Private/Admin
 */
exports.deleteLink = catchAsync(async (req, res, next) => {
  const link = await SocialLink.findByIdAndDelete(req.params.id);

  if (!link) {
    return next(new AppError('No social link found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc    Reorder social links
 * @route   PATCH /api/v1/social-links/reorder
 * @access  Private/Admin
 */
exports.reorderLinks = catchAsync(async (req, res, next) => {
  const { links } = req.body; // Array of { id, order }

  if (!links || !Array.isArray(links)) {
    return next(new AppError('Please provide an array of links with order', 400));
  }

  // Update order for each link
  const updatePromises = links.map((link) =>
    SocialLink.findByIdAndUpdate(link.id, { order: link.order }, { new: true })
  );

  await Promise.all(updatePromises);

  const updatedLinks = await SocialLink.find().sort({ order: 1 });

  res.status(200).json({
    status: 'success',
    data: {
      links: updatedLinks,
    },
  });
});
