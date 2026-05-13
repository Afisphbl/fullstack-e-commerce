"use strict";

const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const { protect, restrictTo } = require("../middleware/auth");
const ROLES = require("../constants/roles");

const router = express.Router();

router.use(protect, restrictTo(ROLES.ADMIN));

router.get("/", dashboardController.getDashboardData);

module.exports = router;
