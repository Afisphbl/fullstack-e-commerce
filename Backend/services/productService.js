'use strict';

const mongoose = require('mongoose');
const Product  = require('../models/productModel');
const Category = require('../models/categoryModel');
const AppError = require('../utils/AppError');

// ─── Product statistics aggregation ──────────────────────────────────────────
const getProductStats = async () => {
  const stats = await Product.aggregate([
    { $match: { ratingsAverage: { $gte: 4 } } },
    {
      $group: {
        _id: '$status',
        numProducts: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgRating: { $avg: '$ratingsAverage' },
        totalSold: { $sum: '$sold' },
      },
    },
    { $sort: { avgPrice: 1 } },
  ]);
  return stats;
};

// ─── Top-5 cheapest, best-rated products alias ────────────────────────────────
const aliasTopProducts = (req, _res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,imageCover,category';
  next();
};

// ─── Featured products ────────────────────────────────────────────────────────
const getFeaturedProducts = async () =>
  Product.find({ isFeatured: true, status: 'active' })
    .select('name price imageCover ratingsAverage slug')
    .limit(10)
    .lean();

// ─── resolveCategoryFilter ─────────────────────────────────────────────────────
/**
 * Express middleware — must be mounted BEFORE the getAll handler.
 *
 * If `req.query.category` is present and is NOT a valid ObjectId, it is
 * treated as a category slug and resolved to its ObjectId automatically.
 * This lets clients send either:
 *   GET /api/v1/products?category=electronics          ← slug (human-friendly)
 *   GET /api/v1/products?category=6642f8c3...          ← ObjectId (programmatic)
 *
 * Returns 404 if the slug doesn't match any category.
 */
const resolveCategoryFilter = async (req, res, next) => {
  try {
    const cat = req.query.category;
    if (!cat) return next();

    // Already a valid ObjectId — nothing to resolve
    if (mongoose.isValidObjectId(cat)) return next();

    // Look up by slug
    const found = await Category.findOne({ slug: cat }).select('_id').lean();
    if (!found) {
      return next(new AppError(`No category found with slug "${cat}".`, 404));
    }

    // Replace slug with the real ObjectId string so APIFeatures can use it
    req.query.category = found._id.toString();
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProductStats,
  aliasTopProducts,
  getFeaturedProducts,
  resolveCategoryFilter,
};
