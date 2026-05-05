'use strict';

const { body } = require('express-validator');
const { PRODUCT_STATUS } = require('../constants/enums');

const createProductRules = [
  body('name').trim().notEmpty().withMessage('Product name is required.')
    .isLength({ max: 200 }).withMessage('Name must be at most 200 characters.'),
  body('description').trim().notEmpty().withMessage('Description is required.'),
  body('price').notEmpty().withMessage('Price is required.')
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number.'),
  body('priceDiscount').optional()
    .isFloat({ min: 0 }).withMessage('Discount must be non-negative.')
    .custom((val, { req }) => +val < +req.body.price)
    .withMessage('Discount price must be below the regular price.'),
  body('stock').notEmpty().withMessage('Stock is required.')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),
  body('category').notEmpty().withMessage('Category is required.')
    .isMongoId().withMessage('Category must be a valid ID.'),
];

const updateProductRules = [
  body('name').optional().trim()
    .isLength({ max: 200 }).withMessage('Name must be at most 200 characters.'),
  body('price').optional()
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number.'),
  body('priceDiscount').optional()
    .isFloat({ min: 0 }).withMessage('Discount must be non-negative.'),
  body('stock').optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),
  body('category').optional()
    .isMongoId().withMessage('Category must be a valid ID.'),
  body('status').optional()
    .isIn(Object.values(PRODUCT_STATUS))
    .withMessage(`Status must be one of: ${Object.values(PRODUCT_STATUS).join(', ')}.`),
];

module.exports = { createProductRules, updateProductRules };
