'use strict';

const Specification = require('../models/specificationModel');
const Product = require('../models/productModel');
const factory = require('./handleFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const MESSAGES = require('../constants/messages');

/**
 * Custom Create Specification
 * Ensures the product's 'specification' field is updated after creation.
 */
exports.createSpecification = catchAsync(async (req, res, next) => {
  // 1. Check if product exists
  const product = await Product.findById(req.body.product);
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  // 2. Create specification
  const doc = await Specification.create(req.body);

  // 3. Link specification to product
  product.specification = doc._id;
  await product.save({ validateBeforeSave: false });

  res.status(201).json({
    status: 'success',
    message: MESSAGES.CREATED,
    data: { data: doc },
  });
});

/**
 * Get Specification by Product ID
 */
exports.getSpecificationByProduct = catchAsync(async (req, res, next) => {
  const doc = await Specification.findOne({ product: req.params.productId });

  if (!doc) {
    return next(new AppError(MESSAGES.NOT_FOUND, 404));
  }

  res.status(200).json({
    status: 'success',
    message: MESSAGES.FETCHED,
    data: { data: doc },
  });
});

/**
 * Custom Delete Specification
 * Ensures the product's 'specification' field is cleared after deletion.
 */
exports.deleteSpecification = catchAsync(async (req, res, next) => {
  const doc = await Specification.findByIdAndDelete(req.params.id);

  if (!doc) {
    return next(new AppError(MESSAGES.NOT_FOUND, 404));
  }

  // Clear reference in product
  await Product.findByIdAndUpdate(doc.product, { $unset: { specification: 1 } });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Standard Update and Get One by ID
exports.getSpecification = factory.getOne(Specification);
exports.updateSpecification = factory.updateOne(Specification);
exports.getAllSpecifications = factory.getAll(Specification);
