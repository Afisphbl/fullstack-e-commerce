'use strict';

const express = require('express');
const specificationController = require('../controllers/specificationController');
const { protect, restrictTo } = require('../middleware/auth');
const ROLES = require('../constants/roles');

const router = express.Router();

// Public routes
router.get('/product/:productId', specificationController.getSpecificationByProduct);
router.get('/:id', specificationController.getSpecification);

// Protected routes (Admin/Manager/SuperAdmin)
router.use(protect);
router.use(restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN));

router.route('/')
  .get(specificationController.getAllSpecifications)
  .post(specificationController.createSpecification);

router.route('/:id')
  .patch(specificationController.updateSpecification)
  .delete(specificationController.deleteSpecification);

module.exports = router;
