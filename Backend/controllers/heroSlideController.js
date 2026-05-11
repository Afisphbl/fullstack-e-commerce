'use strict';

const HeroSlide = require('../models/heroSlideModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { uploadToCloudinary } = require('../utils/cloudinary');

/**
 * @desc    Get all active hero slides (public)
 * @route   GET /api/v1/hero-slides
 * @access  Public
 */
exports.getAllSlides = catchAsync(async (req, res, next) => {
  const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1 });

  res.status(200).json({
    status: 'success',
    results: slides.length,
    data: {
      slides,
    },
  });
});

/**
 * @desc    Get all hero slides (admin)
 * @route   GET /api/v1/hero-slides/admin
 * @access  Private/Admin
 */
exports.getAllSlidesAdmin = catchAsync(async (req, res, next) => {
  const slides = await HeroSlide.find().sort({ order: 1 }).populate('createdBy', 'name email');

  res.status(200).json({
    status: 'success',
    results: slides.length,
    data: {
      slides,
    },
  });
});

/**
 * @desc    Get single hero slide
 * @route   GET /api/v1/hero-slides/:id
 * @access  Public
 */
exports.getSlide = catchAsync(async (req, res, next) => {
  const slide = await HeroSlide.findById(req.params.id);

  if (!slide) {
    return next(new AppError('No slide found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      slide,
    },
  });
});

/**
 * @desc    Create hero slide
 * @route   POST /api/v1/hero-slides
 * @access  Private/Admin
 */
exports.createSlide = catchAsync(async (req, res, next) => {
  // Handle image upload if file is provided
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'voltedge/hero-slides',
      transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
    });
    req.body.image = result.secure_url;
  }

  req.body.createdBy = req.user._id;

  const slide = await HeroSlide.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      slide,
    },
  });
});

/**
 * @desc    Update hero slide
 * @route   PATCH /api/v1/hero-slides/:id
 * @access  Private/Admin
 */
exports.updateSlide = catchAsync(async (req, res, next) => {
  // Handle image upload if file is provided
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'voltedge/hero-slides',
      transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
    });
    req.body.image = result.secure_url;
  }

  const slide = await HeroSlide.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!slide) {
    return next(new AppError('No slide found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      slide,
    },
  });
});

/**
 * @desc    Delete hero slide
 * @route   DELETE /api/v1/hero-slides/:id
 * @access  Private/Admin
 */
exports.deleteSlide = catchAsync(async (req, res, next) => {
  const slide = await HeroSlide.findByIdAndDelete(req.params.id);

  if (!slide) {
    return next(new AppError('No slide found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc    Reorder hero slides
 * @route   PATCH /api/v1/hero-slides/reorder
 * @access  Private/Admin
 */
exports.reorderSlides = catchAsync(async (req, res, next) => {
  const { slides } = req.body; // Array of { id, order }

  if (!slides || !Array.isArray(slides)) {
    return next(new AppError('Please provide an array of slides with order', 400));
  }

  // Update order for each slide
  const updatePromises = slides.map((slide) =>
    HeroSlide.findByIdAndUpdate(slide.id, { order: slide.order }, { new: true })
  );

  await Promise.all(updatePromises);

  const updatedSlides = await HeroSlide.find().sort({ order: 1 });

  res.status(200).json({
    status: 'success',
    data: {
      slides: updatedSlides,
    },
  });
});
