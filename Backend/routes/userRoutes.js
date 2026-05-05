'use strict';

const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateMeRules } = require('../validators/userValidator');
const { uploadUserPhoto, resizeUserPhoto } = require('../middleware/upload');
const ROLES = require('../constants/roles');

const router = express.Router();

// ── All routes below require authentication ───────────────────────────────────
router.use(protect);

// ── Current user ──────────────────────────────────────────────────────────────
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', updateMeRules, validate, userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// ── Avatar upload ─────────────────────────────────────────────────────────────
router.patch('/me/upload-photo', uploadUserPhoto, resizeUserPhoto, userController.updateMe);

// ── Wishlist ──────────────────────────────────────────────────────────────────
router.get('/wishlist', userController.getWishlist);
router.post('/wishlist', userController.addToWishlist);
router.delete('/wishlist/:productId', userController.removeFromWishlist);

// ── Admin-only CRUD ───────────────────────────────────────────────────────────
router.use(restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
