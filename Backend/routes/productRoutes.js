'use strict';

const express = require('express');
const productController = require('../controllers/productController');
const reviewRouter = require('./reviewRoutes');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createProductRules, updateProductRules } = require('../validators/productValidator');
const { uploadProductImages, resizeProductImages } = require('../middleware/upload');
const parseMultilingualFields = require('../middleware/parseMultilingual');
const ROLES = require('../constants/roles');

const router = express.Router();

// ── Mount review nested router ────────────────────────────────────────────────
// GET/POST /api/v1/products/:productId/reviews
router.use('/:productId/reviews', reviewRouter);

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/top-5',    productController.aliasTopProducts, productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/stats',    protect, restrictTo(ROLES.ADMIN), productController.getProductStats);

router.route('/')
  .get(productController.resolveCategoryFilter, productController.getAllProducts)
  .post(protect, restrictTo(ROLES.ADMIN), uploadProductImages, resizeProductImages, parseMultilingualFields, createProductRules, validate, productController.createProduct);

router.route('/:id')
  .get(productController.getProduct)
  .patch(protect, restrictTo(ROLES.ADMIN), uploadProductImages, resizeProductImages, parseMultilingualFields, updateProductRules, validate, productController.updateProduct)
  .delete(protect, restrictTo(ROLES.ADMIN), productController.deleteProduct);


// ── Image upload ──────────────────────────────────────────────────────────────
router.patch(
  '/:id/upload-images',
  protect,
  restrictTo(ROLES.ADMIN),
  uploadProductImages,
  resizeProductImages,
  parseMultilingualFields,
  productController.updateProduct
);

module.exports = router;
