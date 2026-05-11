'use strict';

const express = require('express');
const seoSettingsController = require('../controllers/seoSettingsController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/:page', seoSettingsController.getSEOSettings);

// Admin routes
router.use(protect, restrictTo('admin'));

router.get('/', seoSettingsController.getAllSEOSettings);
router.patch('/:page', seoSettingsController.updateSEOSettings);
router.post('/:page/og-image', uploadSingle('image'), seoSettingsController.uploadOGImage);
router.delete('/:page', seoSettingsController.deleteSEOSettings);

module.exports = router;
