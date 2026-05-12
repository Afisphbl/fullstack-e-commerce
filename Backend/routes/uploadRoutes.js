"use strict";
const express = require("express");
const uploadController = require("../controllers/uploadController");
const { protect, restrictTo } = require("../middleware/auth");
const ROLES = require("../constants/roles");

const router = express.Router();

router.post(
  "/",
  protect,
  restrictTo(ROLES.ADMIN),
  uploadController.uploadImage,
  uploadController.resizeAndUploadToCloudinary,
);

module.exports = router;
