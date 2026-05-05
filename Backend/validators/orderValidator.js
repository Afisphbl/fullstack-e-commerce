'use strict';

const { body } = require('express-validator');
const { PAYMENT_METHOD } = require('../constants/enums');

const shippingAddressRules = [
  body('shippingAddress.street').trim().notEmpty().withMessage('Street is required.'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required.'),
  body('shippingAddress.zip').trim().notEmpty().withMessage('ZIP code is required.'),
  body('shippingAddress.country').trim().notEmpty().withMessage('Country is required.'),
];

const createOrderRules = [
  body('orderItems').isArray({ min: 1 }).withMessage('Order must have at least one item.'),
  body('orderItems.*.product').isMongoId().withMessage('Each item must have a valid product ID.'),
  body('orderItems.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
  body('paymentMethod').optional()
    .isIn(Object.values(PAYMENT_METHOD))
    .withMessage(`Payment method must be one of: ${Object.values(PAYMENT_METHOD).join(', ')}.`),
  ...shippingAddressRules,
];

module.exports = { createOrderRules };
