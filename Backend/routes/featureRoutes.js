'use strict';

const express = require('express');
const featureController = require('../controllers/featureController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', featureController.getAllFeatures);
router.get('/:id', featureController.getFeature);

// Admin routes
router.use(protect, restrictTo('admin'));

router.get('/admin/all', featureController.getAllFeaturesAdmin);
router.post('/', featureController.createFeature);
router.patch('/reorder', featureController.reorderFeatures);
router
  .route('/:id')
  .patch(featureController.updateFeature)
  .delete(featureController.deleteFeature);

module.exports = router;
