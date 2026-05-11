'use strict';

const express = require('express');
const faqController = require('../controllers/faqController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', faqController.getAllFAQs);
router.get('/categories', faqController.getCategories);
router.get('/:id', faqController.getFAQ);

// Admin routes
router.use(protect, restrictTo('admin'));

router.get('/admin/all', faqController.getAllFAQsAdmin);
router.post('/', faqController.createFAQ);
router.patch('/reorder', faqController.reorderFAQs);
router
  .route('/:id')
  .patch(faqController.updateFAQ)
  .delete(faqController.deleteFAQ);

module.exports = router;
