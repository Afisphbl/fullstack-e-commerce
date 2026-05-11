'use strict';

const express = require('express');
const settingController = require('../controllers/settingController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post(
  '/media/upload',
  auth.protect,
  auth.restrictTo('admin'),
  upload.uploadMediaImage,
  upload.resizeMediaImage,
  (req, res) => {
    res.status(200).json({
      status: 'success',
      data: { url: req.body.url },
    });
  }
);

router
  .route('/')
  .get(settingController.getSettings)
  .patch(auth.protect, auth.restrictTo('admin'), settingController.updateSettings);

module.exports = router;
