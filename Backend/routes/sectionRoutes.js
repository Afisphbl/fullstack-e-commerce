'use strict';

const express = require('express');
const sectionController = require('../controllers/sectionController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public route to get active sections ordered by `order`
router.get('/active', sectionController.aliasActiveSections, sectionController.getAllSections);

router
  .route('/')
  .get(sectionController.getAllSections) // Admin can see all, including inactive
  .post(auth.protect, auth.restrictTo('admin'), sectionController.createSection);

router
  .route('/:id')
  .get(sectionController.getSection)
  .patch(auth.protect, auth.restrictTo('admin'), sectionController.updateSection)
  .delete(auth.protect, auth.restrictTo('admin'), sectionController.deleteSection);

module.exports = router;
