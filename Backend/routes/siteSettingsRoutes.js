'use strict';

const express = require('express');
const siteSettingsController = require('../controllers/siteSettingsController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', siteSettingsController.getSettings);

// Admin routes
router.use(protect, restrictTo('admin'));

router.patch('/', siteSettingsController.updateSettings);
router.post('/logo', uploadSingle('logo'), siteSettingsController.uploadLogo);
router.post('/favicon', uploadSingle('favicon'), siteSettingsController.uploadFavicon);

module.exports = router;
