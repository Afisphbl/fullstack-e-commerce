'use strict';

const express = require('express');
const socialLinkController = require('../controllers/socialLinkController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', socialLinkController.getAllLinks);
router.get('/:id', socialLinkController.getLink);

// Admin routes
router.use(protect, restrictTo('admin'));

router.get('/admin/all', socialLinkController.getAllLinksAdmin);
router.post('/', socialLinkController.createLink);
router.patch('/reorder', socialLinkController.reorderLinks);
router
  .route('/:id')
  .patch(socialLinkController.updateLink)
  .delete(socialLinkController.deleteLink);

module.exports = router;
