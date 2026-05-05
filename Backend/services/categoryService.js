'use strict';

// Category service is intentionally thin — all logic is handled by
// the factory pattern. Additional methods can be added here as needed.

const Category = require('../models/categoryModel');

/**
 * Returns a flat list of all active categories with their sub-categories
 * eagerly populated (virtual populate).
 */
const getCategoryTree = async () =>
  Category.find({ parent: null, isActive: true })
    .populate({ path: 'subCategories', select: 'name slug image isActive' })
    .lean();

module.exports = { getCategoryTree };
