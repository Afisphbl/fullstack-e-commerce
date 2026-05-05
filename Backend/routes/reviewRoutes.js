'use strict';

const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createReviewRules, updateReviewRules } = require('../validators/reviewValidator');
const ROLES = require('../constants/roles');

// mergeParams allows access to :productId from the parent router
const router = express.Router({ mergeParams: true });

router.use(protect);

router.route('/')
  .get(reviewController.setProductFilter, reviewController.getAllReviews)
  .post(
    restrictTo(ROLES.USER),
    reviewController.setProductAndUser,
    createReviewRules,
    validate,
    reviewController.createReview
  );

router.route('/:id')
  .get(reviewController.getReview)
  .patch(restrictTo(ROLES.USER, ROLES.ADMIN), updateReviewRules, validate, reviewController.updateReview)
  .delete(restrictTo(ROLES.USER, ROLES.ADMIN), reviewController.deleteReview);

module.exports = router;
