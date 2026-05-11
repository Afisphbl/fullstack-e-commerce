'use strict';

const express = require('express');
const pageController = require('../controllers/pageController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/slug/:slug', pageController.getPageBySlug);

router
  .route('/')
  .get(pageController.getAllPages)
  .post(auth.protect, auth.restrictTo('admin'), pageController.createPage);

router
  .route('/:id')
  .get(pageController.getPage)
  .patch(auth.protect, auth.restrictTo('admin'), pageController.updatePage)
  .delete(auth.protect, auth.restrictTo('admin'), pageController.deletePage);

module.exports = router;
