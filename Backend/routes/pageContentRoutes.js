'use strict';

const express = require('express');
const pageContentController = require('../controllers/pageContentController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/:page', pageContentController.getPageContent);

// Admin routes
router.use(protect, restrictTo('admin'));

router.get('/', pageContentController.getAllPageContents);
router.patch('/:page', pageContentController.updatePageContent);
router.patch('/:page/section/:key', pageContentController.updateSection);
router.post('/:page/section/:key/image', uploadSingle('image'), pageContentController.uploadSectionImage);

module.exports = router;
