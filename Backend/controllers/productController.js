'use strict';

const Product = require('../models/productModel');
const factory = require('./handleFactory');
const catchAsync = require('../utils/catchAsync');
const productService = require('../services/productService');

// ── Alias middleware ──────────────────────────────────────────────────────────
exports.aliasTopProducts = productService.aliasTopProducts;

// ── Category slug resolver (must run before getAllProducts) ───────────────────
exports.resolveCategoryFilter = productService.resolveCategoryFilter;

// ── Stats aggregation ─────────────────────────────────────────────────────────
exports.getProductStats = catchAsync(async (req, res) => {
  const stats = await productService.getProductStats();
  res.status(200).json({ status: 'success', data: { stats } });
});

// ── Featured products ─────────────────────────────────────────────────────────
exports.getFeaturedProducts = catchAsync(async (req, res) => {
  const products = await productService.getFeaturedProducts();
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products },
  });
});

// ── Factory CRUD ──────────────────────────────────────────────────────────────
exports.getAllProducts  = factory.getAll(Product);
exports.getProduct     = factory.getOne(Product, { path: 'reviews' });
exports.createProduct  = factory.createOne(Product);
exports.updateProduct  = factory.updateOne(Product);
exports.deleteProduct  = factory.deleteOne(Product);
