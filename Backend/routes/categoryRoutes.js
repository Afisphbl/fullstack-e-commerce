'use strict';

const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middleware/auth');
const ROLES = require('../constants/roles');

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/tree', categoryController.getCategoryTree);

router.route('/')
  .get(categoryController.getAllCategories)
  .post(protect, restrictTo(ROLES.ADMIN), categoryController.createCategory);

router.route('/:id')
  .get(categoryController.getCategory)
  .patch(protect, restrictTo(ROLES.ADMIN), categoryController.updateCategory)
  .delete(protect, restrictTo(ROLES.ADMIN), categoryController.deleteCategory);

module.exports = router;
