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
exports.getAllCategories = factory.getAll(Category);
exports.getCategory     = factory.getOne(Category, { path: 'subCategories', select: 'name slug' });
exports.createCategory  = factory.createOne(Category);
exports.updateCategory  = factory.updateOne(Category);
exports.deleteCategory  = factory.deleteOne(Category);
