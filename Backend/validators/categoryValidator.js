'use strict';

const { body } = require('express-validator');
const { validateMultilingualField } = require('./productValidator');

const createCategoryRules = [
  // Multilingual fields
  ...validateMultilingualField('name', true, 100),
  ...validateMultilingualField('description', false, 500),
  
  // Non-multilingual fields
  body('parent').optional()
    .isMongoId().withMessage('Parent must be a valid category ID.'),
  body('isActive').optional()
    .isBoolean().withMessage('isActive must be a boolean.'),
];

const updateCategoryRules = [
  // Multilingual fields (all optional for updates)
  ...validateMultilingualField('name', false, 100),
  ...validateMultilingualField('description', false, 500),
  
  // Non-multilingual fields
  body('parent').optional()
    .isMongoId().withMessage('Parent must be a valid category ID.'),
  body('isActive').optional()
    .isBoolean().withMessage('isActive must be a boolean.'),
];

module.exports = { createCategoryRules, updateCategoryRules };
