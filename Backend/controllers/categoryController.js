'use strict';

const Category = require('../models/categoryModel');
const factory = require('./handleFactory');
const catchAsync = require('../utils/catchAsync');
const categoryService = require('../services/categoryService');

// ── Category tree ─────────────────────────────────────────────────────────────
exports.getCategoryTree = catchAsync(async (req, res) => {
  const tree = await categoryService.getCategoryTree();
  res.status(200).json({
    status: 'success',
    results: tree.length,
    data: { categories: tree },
  });
});

// ── Factory CRUD ──────────────────────────────────────────────────────────────
exports.getAllCategories = catchAsync(async (req, res) => {
  const categories = await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        as: 'products',
      },
    },
    {
      $addFields: {
        count: { $size: '$products' },
      },
    },
    {
      $project: {
        products: 0,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: { data: categories },
  });
});

exports.getCategory     = factory.getOne(Category, { path: 'subCategories', select: 'name slug' });

exports.createCategory  = factory.createOne(Category);
exports.updateCategory  = factory.updateOne(Category);
exports.deleteCategory  = factory.deleteOne(Category);
