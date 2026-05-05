'use strict';

const { body } = require('express-validator');

const updateMeRules = [
  body('name').optional().trim()
    .isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters.'),
  body('email').optional().trim()
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),
  // Disallow password updates via this route
  body('password').isEmpty().withMessage('This route is not for password updates. Use /updateMyPassword.'),
  body('passwordConfirm').isEmpty().withMessage('This route is not for password updates.'),
];

module.exports = { updateMeRules };
