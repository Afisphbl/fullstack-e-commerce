'use strict';

const { body } = require('express-validator');

const submitContactFormRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be 2–60 characters.'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Must be a valid email address.')
    .normalizeEmail(),
  
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Must be a valid phone number.'),
  
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required.')
    .isLength({ min: 3, max: 200 })
    .withMessage('Subject must be 3–200 characters.'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required.')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Message must be 10–5000 characters.'),
];

module.exports = {
  submitContactFormRules,
};
