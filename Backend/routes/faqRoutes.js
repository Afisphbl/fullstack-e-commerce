'use strict';

const express = require('express');
const faqController = require('../controllers/faqController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public route to get active FAQs
router.get('/active', faqController.aliasActiveFAQs, faqController.getAllFAQs);

router
  .route('/')
  .get(faqController.getAllFAQs)
  .post(auth.protect, auth.restrictTo('admin'), faqController.createFAQ);

router
  .route('/:id')
  .get(faqController.getFAQ)
  .patch(auth.protect, auth.restrictTo('admin'), faqController.updateFAQ)
  .delete(auth.protect, auth.restrictTo('admin'), faqController.deleteFAQ);

module.exports = router;
