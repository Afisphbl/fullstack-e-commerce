'use strict';

const express = require('express');
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router.route('/')
  .get(cartController.getMyCart)
  .post(cartController.addItem)
  .delete(cartController.clearCart);

router.route('/coupon')
  .post(cartController.applyCoupon)
  .delete(cartController.removeCoupon);

router.route('/:productId')
  .patch(cartController.updateItem)
  .delete(cartController.removeItem);

module.exports = router;
