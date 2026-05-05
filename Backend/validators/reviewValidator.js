'use strict';

const { body } = require('express-validator');

const createReviewRules = [
  body('review').trim().notEmpty().withMessage('Review text is required.')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review must be 10–1000 characters.'),
  body('rating').notEmpty().withMessage('Rating is required.')
    .isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
  body('product').optional().isMongoId().withMessage('Product must be a valid ID.'),
];

const updateReviewRules = [
  body('review').optional().trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review must be 10–1000 characters.'),
  body('rating').optional()
    .isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
];

module.exports = { createReviewRules, updateReviewRules };
