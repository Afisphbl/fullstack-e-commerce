'use strict';

const PageContent = require('../models/pageContentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { uploadToCloudinary } = require('../utils/cloudinary');

/**
 * @desc    Get page content (public)
 * @route   GET /api/v1/content/:page
 * @access  Public
 */
exports.getPageContent = catchAsync(async (req, res, next) => {
  const { page } = req.params;

  let content = await PageContent.findOne({ page });

  // If content doesn't exist, create default
  if (!content) {
    content = await PageContent.create({ page, sections: [] });
  }

  res.status(200).json({
    status: 'success',
    data: {
      content,
    },
  });
});

/**
 * @desc    Update page content
 * @route   PATCH /api/v1/content/:page
 * @access  Private/Admin
 */
exports.updatePageContent = catchAsync(async (req, res, next) => {
  const { page } = req.params;
  const { sections } = req.body;

  if (!sections) {
    return next(new AppError('Please provide sections to update', 400));
  }

  let content = await PageContent.findOne({ page });

  if (!content) {
    content = await PageContent.create({
      page,
      sections,
      updatedBy: req.user._id,
    });
  } else {
    content.sections = sections;
    content.updatedBy = req.user._id;
    await content.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      content,
    },
  });
});

/**
 * @desc    Update single section
 * @route   PATCH /api/v1/content/:page/section/:key
 * @access  Private/Admin
 */
exports.updateSection = catchAsync(async (req, res, next) => {
  const { page, key } = req.params;

  let content = await PageContent.findOne({ page });

  if (!content) {
    content = await PageContent.create({ page, sections: [] });
  }

  content.updateSection(key, req.body);
  content.updatedBy = req.user._id;
  await content.save();

  res.status(200).json({
    status: 'success',
    data: {
      content,
    },
  });
});

/**
 * @desc    Upload section image
 * @route   POST /api/v1/content/:page/section/:key/image
 * @access  Private/Admin
 */
exports.uploadSectionImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  const { page, key } = req.params;

  // Upload to Cloudinary
  const result = await uploadToCloudinary(req.file.buffer, {
    folder: `voltedge/content/${page}`,
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
  });

  let content = await PageContent.findOne({ page });

  if (!content) {
    content = await PageContent.create({ page, sections: [] });
  }

  content.updateSection(key, { image: result.secure_url });
  content.updatedBy = req.user._id;
  await content.save();

  res.status(200).json({
    status: 'success',
    data: {
      imageUrl: result.secure_url,
      content,
    },
  });
});

/**
 * @desc    Get all page contents (admin)
 * @route   GET /api/v1/content
 * @access  Private/Admin
 */
exports.getAllPageContents = catchAsync(async (req, res, next) => {
  const contents = await PageContent.find().populate('updatedBy', 'name email');

  res.status(200).json({
    status: 'success',
    results: contents.length,
    data: {
      contents,
    },
  });
});
