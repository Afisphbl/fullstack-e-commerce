'use strict';

/**
 * Seed / wipe the database.
 *
 * Usage:
 *   node utils/importData.js --import   → import all JSON fixtures
 *   node utils/importData.js --delete   → wipe all collections
 */

require('../config/env');

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const logger = require('../logs/logger');

const User     = require('../models/userModel');
const Product  = require('../models/productModel');
const Category = require('../models/categoryModel');
const Review   = require('../models/reviewModel');
const Order    = require('../models/orderModel');
const Coupon   = require('../models/couponModel');

// ─── Connect ──────────────────────────────────────────────────────────────────
const connectDB = async () => {
  const uri = process.env.DATABASE_HOST.replace('<db_password>', process.env.DB_PASSWORD);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  logger.info('MongoDB connected for seeding.');
};

// ─── Load fixtures ────────────────────────────────────────────────────────────
const fixturesDir = path.join(__dirname, '..', 'data');

const loadJSON = (filename) => {
  const filePath = path.join(fixturesDir, filename);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

// ─── Import ───────────────────────────────────────────────────────────────────
const importData = async () => {
  try {
    const categories = loadJSON('categories.json');
    const users      = loadJSON('users.json');
    const products   = loadJSON('products.json');
    const reviews    = loadJSON('reviews.json');
    const coupons    = loadJSON('coupons.json');

    if (categories) await Category.create(categories, { validateBeforeSave: false });
    if (users)      await User.create(users,      { validateBeforeSave: false });
    if (products)   await Product.create(products, { validateBeforeSave: false });
    if (reviews)    await Review.create(reviews,   { validateBeforeSave: false });
    if (coupons)    await Coupon.create(coupons,   { validateBeforeSave: false });

    logger.info('✅  Data imported successfully.');
  } catch (err) {
    logger.error(`Import failed: ${err.message}`);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

// ─── Delete ───────────────────────────────────────────────────────────────────
const deleteData = async () => {
  try {
    await Promise.all([
      Category.deleteMany(),
      User.deleteMany(),
      Product.deleteMany(),
      Review.deleteMany(),
      Order.deleteMany(),
      Coupon.deleteMany(),
    ]);
    logger.info('🗑️  All data deleted successfully.');
  } catch (err) {
    logger.error(`Delete failed: ${err.message}`);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

// ─── Run ──────────────────────────────────────────────────────────────────────
(async () => {
  await connectDB();
  if (process.argv[2] === '--import') return importData();
  if (process.argv[2] === '--delete') return deleteData();
  logger.error('Pass --import or --delete as argument.');
  process.exit(1);
})();
