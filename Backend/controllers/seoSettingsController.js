'use strict';

const SEOSettings = require('../models/seoSettingsModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { uploadToCloudinary } = require('../utils/cloudinary');

/**
 * @desc    Get SEO settings for a page (public)
 * @route   GET /api/v1/seo/:page
 * @access  Public
 */
exports.getSEOSettings = catchAsync(async (req, res, next) => {
  const { page } = req.params;

  let settings = await SEOSettings.findOne({ page });

  // If settings don't exist, return defaults
  if (!settings) {
    settings = {
      page,
      metaTitle: `${page.charAt(0).toUpperCase() + page.slice(1)} | VoltEdge`,
      metaDescription: 'Your premium destination for cutting-edge electronics',
      metaKeywords: [],
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      twitterCard: 'summary_large_image',
      canonicalUrl: '',
    };
  }

  res.status(200).json({
    status: 'success',
    data: {
      settings,
    },
  });
});

/**
 * @desc    Get all SEO settings (admin)
 * @route   GET /api/v1/seo
 * @access  Private/Admin
 */
exports.getAllSEOSettings = catchAsync(async (req, res, next) => {
  const settings = await SEOSettings.find().populate('updatedBy', 'name email');

  res.status(200).json({
    status: 'success',
    results: settings.length,
    data: {
      settings,
    },
  });
});

/**
 * @desc    Update SEO settings for a page
 * @route   PATCH /api/v1/seo/:page
 * @access  Private/Admin
 */
exports.updateSEOSettings = catchAsync(async (req, res, next) => {
  const { page } = req.params;

  req.body.updatedBy = req.user._id;
  req.body.page = page;

  const settings = await SEOSettings.findOneAndUpdate(
    { page },
    req.body,
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      settings,
    },
  });
});

/**
 * @desc    Upload OG image for a page
 * @route   POST /api/v1/seo/:page/og-image
 * @access  Private/Admin
 */
exports.uploadOGImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  const { page } = req.params;

  // Upload to Cloudinary
  const result = await uploadToCloudinary(req.file.buffer, {
    folder: `voltedge/seo/${page}`,
    transformation: [{ width: 1200, height: 630, crop: 'fill', quality: 'auto' }],
  });

  let settings = await SEOSettings.findOne({ page });

  if (!settings) {
    settings = await SEOSettings.create({
      page,
      metaTitle: `${page.charAt(0).toUpperCase() + page.slice(1)} | VoltEdge`,
      metaDescription: 'Your premium destination for cutting-edge electronics',
      ogImage: result.secure_url,
      updatedBy: req.user._id,
    });
  } else {
    settings.ogImage = result.secure_url;
    settings.updatedBy = req.user._id;
    await settings.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      imageUrl: result.secure_url,
      settings,
    },
  });
});

/**
 * @desc    Delete SEO settings for a page
 * @route   DELETE /api/v1/seo/:page
 * @access  Private/Admin
 */
exports.deleteSEOSettings = catchAsync(async (req, res, next) => {
  const { page } = req.params;

  const settings = await SEOSettings.findOneAndDelete({ page });

  if (!settings) {
    return next(new AppError('No SEO settings found for this page', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
