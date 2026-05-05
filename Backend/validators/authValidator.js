'use strict';

const { body } = require('express-validator');

const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters.'),
  body('email').trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('passwordConfirm').notEmpty().withMessage('Password confirmation is required.')
    .custom((val, { req }) => val === req.body.password)
    .withMessage('Passwords do not match.'),
];

const loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

const forgotPasswordRules = [
  body('email').trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),
];

const resetPasswordRules = [
  body('password').notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('passwordConfirm').notEmpty().withMessage('Password confirmation is required.')
    .custom((val, { req }) => val === req.body.password)
    .withMessage('Passwords do not match.'),
];

const updatePasswordRules = [
  body('passwordCurrent').notEmpty().withMessage('Current password is required.'),
  body('password').notEmpty().withMessage('New password is required.')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'),
  body('passwordConfirm').notEmpty().withMessage('Password confirmation is required.')
    .custom((val, { req }) => val === req.body.password)
    .withMessage('Passwords do not match.'),
];

module.exports = {
  signupRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  updatePasswordRules,
};
