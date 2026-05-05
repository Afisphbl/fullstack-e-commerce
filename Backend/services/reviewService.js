'use strict';

const Review = require('../models/reviewModel');

/**
 * Set product + user on req.body for nested route:
 *   POST /api/v1/products/:productId/reviews
 */
const setProductAndUser = (req, _res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

/**
 * Build filter for nested route so getAll only returns
 * reviews for a specific product.
 */
const setProductFilter = (req, _res, next) => {
  if (req.params.productId) req.filterObj = { product: req.params.productId };
  next();
};

module.exports = { setProductAndUser, setProductFilter };
