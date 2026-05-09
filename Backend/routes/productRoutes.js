'use strict';

const express = require('express');
const productController = require('../controllers/productController');
const reviewRouter = require('./reviewRoutes');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createProductRules, updateProductRules } = require('../validators/productValidator');
const { uploadProductImages, resizeProductImages } = require('../middleware/upload');
const ROLES = require('../constants/roles');

const router = express.Router();

// ── Mount review nested router ────────────────────────────────────────────────
// GET/POST /api/v1/products/:productId/reviews
router.use('/:productId/reviews', reviewRouter);

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/top-5',    productController.aliasTopProducts, productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/stats',    protect, restrictTo(ROLES.ADMIN, ROLES.MANAGER), productController.getProductStats);

router.route('/')
  .get(productController.resolveCategoryFilter, productController.getAllProducts)
  .post(protect, restrictTo(ROLES.ADMIN, ROLES.MANAGER), uploadProductImages, resizeProductImages, createProductRules, validate, productController.createProduct);

router.route('/:id')
  .get(productController.getProduct)
  .patch(protect, restrictTo(ROLES.ADMIN, ROLES.MANAGER), uploadProductImages, resizeProductImages, updateProductRules, validate, productController.updateProduct)
  .delete(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN), productController.deleteProduct);


// ── Image upload ──────────────────────────────────────────────────────────────
router.patch(
  '/:id/upload-images',
  protect,
  restrictTo(ROLES.ADMIN, ROLES.MANAGER),
  uploadProductImages,
  resizeProductImages,
  productController.updateProduct
);

module.exports = router;
