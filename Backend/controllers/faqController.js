'use strict';

const FAQ = require('../models/faqModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * @desc    Get all active FAQs (public)
 * @route   GET /api/v1/faqs
 * @access  Public
 */
exports.getAllFAQs = catchAsync(async (req, res, next) => {
  const { category, search } = req.query;

  const query = { isActive: true };

  if (category) {
    query.category = category;
  }

  let faqs;

  if (search) {
    faqs = await FAQ.find({
      ...query,
      $text: { $search: search },
    }).sort({ score: { $meta: 'textScore' }, order: 1 });
  } else {
    faqs = await FAQ.find(query).sort({ category: 1, order: 1 });
  }

  res.status(200).json({
    status: 'success',
    results: faqs.length,
    data: {
      faqs,
    },
  });
});

/**
 * @desc    Get all FAQs (admin)
 * @route   GET /api/v1/faqs/admin
 * @access  Private/Admin
 */
exports.getAllFAQsAdmin = catchAsync(async (req, res, next) => {
  const faqs = await FAQ.find().sort({ category: 1, order: 1 }).populate('createdBy', 'name email');

  res.status(200).json({
    status: 'success',
    results: faqs.length,
    data: {
      faqs,
    },
  });
});

/**
 * @desc    Get single FAQ
 * @route   GET /api/v1/faqs/:id
 * @access  Public
 */
exports.getFAQ = catchAsync(async (req, res, next) => {
  const faq = await FAQ.findById(req.params.id);

  if (!faq) {
    return next(new AppError('No FAQ found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      faq,
    },
  });
});

/**
 * @desc    Create FAQ
 * @route   POST /api/v1/faqs
 * @access  Private/Admin
 */
exports.createFAQ = catchAsync(async (req, res, next) => {
  req.body.createdBy = req.user._id;

  const faq = await FAQ.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      faq,
    },
  });
});

/**
 * @desc    Update FAQ
 * @route   PATCH /api/v1/faqs/:id
 * @access  Private/Admin
 */
exports.updateFAQ = catchAsync(async (req, res, next) => {
  const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!faq) {
    return next(new AppError('No FAQ found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      faq,
    },
  });
});

/**
 * @desc    Delete FAQ
 * @route   DELETE /api/v1/faqs/:id
 * @access  Private/Admin
 */
exports.deleteFAQ = catchAsync(async (req, res, next) => {
  const faq = await FAQ.findByIdAndDelete(req.params.id);

  if (!faq) {
    return next(new AppError('No FAQ found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc    Reorder FAQs within category
 * @route   PATCH /api/v1/faqs/reorder
 * @access  Private/Admin
 */
exports.reorderFAQs = catchAsync(async (req, res, next) => {
  const { faqs } = req.body; // Array of { id, order }

  if (!faqs || !Array.isArray(faqs)) {
    return next(new AppError('Please provide an array of FAQs with order', 400));
  }

  // Update order for each FAQ
  const updatePromises = faqs.map((faq) =>
    FAQ.findByIdAndUpdate(faq.id, { order: faq.order }, { new: true })
  );

  await Promise.all(updatePromises);

  const updatedFAQs = await FAQ.find().sort({ category: 1, order: 1 });

  res.status(200).json({
    status: 'success',
    data: {
      faqs: updatedFAQs,
    },
  });
});

/**
 * @desc    Get FAQ categories
 * @route   GET /api/v1/faqs/categories
 * @access  Public
 */
exports.getCategories = catchAsync(async (req, res, next) => {
  const categories = await FAQ.distinct('category', { isActive: true });

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      categories,
    },
  });
});
