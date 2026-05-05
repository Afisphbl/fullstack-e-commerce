'use strict';

const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/security');
const {
  signupRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  updatePasswordRules,
} = require('../validators/authValidator');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/signup',         authLimiter, signupRules,         validate, authController.signup);
router.post('/login',          authLimiter, loginRules,          validate, authController.login);
router.post('/logout',         authController.logout);
router.post('/forgotPassword', authLimiter, forgotPasswordRules, validate, authController.forgotPassword);
router.patch('/resetPassword/:token', resetPasswordRules, validate, authController.resetPassword);

// Protected
router.patch('/updateMyPassword', protect, updatePasswordRules, validate, authController.updateMyPassword);

module.exports = router;
