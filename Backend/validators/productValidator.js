'use strict';

const { body } = require('express-validator');
const { PRODUCT_STATUS } = require('../constants/enums');

// Multilingual field validation helper
const validateMultilingualField = (fieldName, required = true, maxLength = null) => {
  const rules = [];
  
  // Amharic
  if (required) {
    rules.push(
      body(`${fieldName}.am`)
        .trim()
        .notEmpty()
        .withMessage(`${fieldName} (Amharic) is required.`)
    );
  } else {
    rules.push(body(`${fieldName}.am`).optional().trim());
  }
  
  if (maxLength) {
    rules.push(
      body(`${fieldName}.am`)
        .isLength({ max: maxLength })
        .withMessage(`${fieldName} (Amharic) must be at most ${maxLength} characters.`)
    );
  }
  
  // English
  if (required) {
    rules.push(
      body(`${fieldName}.en`)
        .trim()
        .notEmpty()
        .withMessage(`${fieldName} (English) is required.`)
    );
  } else {
    rules.push(body(`${fieldName}.en`).optional().trim());
  }
  
  if (maxLength) {
    rules.push(
      body(`${fieldName}.en`)
        .isLength({ max: maxLength })
        .withMessage(`${fieldName} (English) must be at most ${maxLength} characters.`)
    );
  }
  
  // Afaan Oromo
  if (required) {
    rules.push(
      body(`${fieldName}.om`)
        .trim()
        .notEmpty()
        .withMessage(`${fieldName} (Afaan Oromo) is required.`)
    );
  } else {
    rules.push(body(`${fieldName}.om`).optional().trim());
  }
  
  if (maxLength) {
    rules.push(
      body(`${fieldName}.om`)
        .isLength({ max: maxLength })
        .withMessage(`${fieldName} (Afaan Oromo) must be at most ${maxLength} characters.`)
    );
  }
  
  return rules;
};

const createProductRules = [
  // Multilingual fields
  ...validateMultilingualField('name', true, 200),
  ...validateMultilingualField('description', true),
  ...validateMultilingualField('shortDescription', false, 300),
  
  // Non-multilingual fields
  body('price').notEmpty().withMessage('Price is required.')
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number.'),
  body('priceDiscount').optional()
    .isFloat({ min: 0 }).withMessage('Discount must be non-negative.'),
  body('discountPercent').optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Discount percentage must be between 0 and 100.'),
  body('stock').notEmpty().withMessage('Stock is required.')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),
  body('category').notEmpty().withMessage('Category is required.')
    .isMongoId().withMessage('Category must be a valid ID.'),
  body('brand').optional().trim()
    .isLength({ max: 100 }).withMessage('Brand must be at most 100 characters.'),
  body('status').optional()
    .isIn(Object.values(PRODUCT_STATUS))
    .withMessage(`Status must be one of: ${Object.values(PRODUCT_STATUS).join(', ')}.`),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean.'),
];

const updateProductRules = [
  // Multilingual fields (all optional for updates)
  ...validateMultilingualField('name', false, 200),
  ...validateMultilingualField('description', false),
  ...validateMultilingualField('shortDescription', false, 300),
  
  // Non-multilingual fields
  body('price').optional()
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number.'),
  body('priceDiscount').optional()
    .isFloat({ min: 0 }).withMessage('Discount must be non-negative.'),
  body('discountPercent').optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Discount percentage must be between 0 and 100.'),
  body('stock').optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),
  body('category').optional()
    .isMongoId().withMessage('Category must be a valid ID.'),
  body('brand').optional().trim()
    .isLength({ max: 100 }).withMessage('Brand must be at most 100 characters.'),
  body('status').optional()
    .isIn(Object.values(PRODUCT_STATUS))
    .withMessage(`Status must be one of: ${Object.values(PRODUCT_STATUS).join(', ')}.`),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean.'),
];

module.exports = { createProductRules, updateProductRules, validateMultilingualField };
