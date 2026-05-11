'use strict';

const SiteSettings = require('../models/siteSettingsModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { uploadToCloudinary } = require('../utils/cloudinary');

/**
 * @desc    Get site settings (public)
 * @route   GET /api/v1/settings
 * @access  Public
 */
exports.getSettings = catchAsync(async (req, res, next) => {
  const settings = await SiteSettings.getInstance();

  res.status(200).json({
    status: 'success',
    data: {
      settings,
    },
  });
});

/**
 * @desc    Update site settings
 * @route   PATCH /api/v1/settings
 * @access  Private/Admin
 */
exports.updateSettings = catchAsync(async (req, res, next) => {
  const settings = await SiteSettings.getInstance();

  // Fields that can be updated
  const allowedFields = [
    'siteName',
    'siteTagline',
    'contactEmail',
    'contactPhone',
    'contactAddress',
    'mapLatitude',
    'mapLongitude',
    'mapEmbedUrl',
    'workingHours',
    'footerText',
    'copyrightText',
  ];

  // Update only allowed fields
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      settings[field] = req.body[field];
    }
  });

  settings.updatedBy = req.user._id;
  await settings.save();

  res.status(200).json({
    status: 'success',
    data: {
      settings,
    },
  });
});

/**
 * @desc    Upload site logo
 * @route   POST /api/v1/settings/logo
 * @access  Private/Admin
 */
exports.uploadLogo = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a logo image', 400));
  }

  const settings = await SiteSettings.getInstance();

  // Upload to Cloudinary
  const result = await uploadToCloudinary(req.file.buffer, {
    folder: 'voltedge/settings',
    public_id: `logo_${Date.now()}`,
    transformation: [{ width: 300, height: 100, crop: 'limit' }],
  });

  settings.siteLogo = result.secure_url;
  settings.updatedBy = req.user._id;
  await settings.save();

  res.status(200).json({
    status: 'success',
    data: {
      logoUrl: result.secure_url,
    },
  });
});

/**
 * @desc    Upload site favicon
 * @route   POST /api/v1/settings/favicon
 * @access  Private/Admin
 */
exports.uploadFavicon = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a favicon image', 400));
  }

  const settings = await SiteSettings.getInstance();

  // Upload to Cloudinary
  const result = await uploadToCloudinary(req.file.buffer, {
    folder: 'voltedge/settings',
    public_id: `favicon_${Date.now()}`,
    transformation: [{ width: 32, height: 32, crop: 'fill' }],
  });

  settings.siteFavicon = result.secure_url;
  settings.updatedBy = req.user._id;
  await settings.save();

  res.status(200).json({
    status: 'success',
    data: {
      faviconUrl: result.secure_url,
    },
  });
});
