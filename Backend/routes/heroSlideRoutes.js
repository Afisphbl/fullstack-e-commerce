'use strict';

const express = require('express');
const heroSlideController = require('../controllers/heroSlideController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', heroSlideController.getAllSlides);
router.get('/:id', heroSlideController.getSlide);

// Admin routes
router.use(protect, restrictTo('admin'));

router.get('/admin/all', heroSlideController.getAllSlidesAdmin);
router.post('/', uploadSingle('image'), heroSlideController.createSlide);
router.patch('/reorder', heroSlideController.reorderSlides);
router
  .route('/:id')
  .patch(uploadSingle('image'), heroSlideController.updateSlide)
  .delete(heroSlideController.deleteSlide);

module.exports = router;
