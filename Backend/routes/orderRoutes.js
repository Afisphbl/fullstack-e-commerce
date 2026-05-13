"use strict";

const express = require("express");
const orderController = require("../controllers/orderController");
const { protect, restrictTo } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createOrderRules } = require("../validators/orderValidator");
const ROLES = require("../constants/roles");

const router = express.Router();

router.use(protect);

// ── User: create & view own orders ────────────────────────────────────────────
router
  .route("/")
  .get(orderController.setUserFilter, orderController.getAllOrders)
  .post(createOrderRules, validate, orderController.createOrder);

// ── Admin only (Stats) ────────────────────────────────────────────────────────
router.get(
  "/stats/overview",
  restrictTo(ROLES.ADMIN),
  orderController.getOrderStats,
);

// ── Shared: view single order ─────────────────────────────────────────────────
router.get("/:id", orderController.setUserFilter, orderController.getOrder);

// ── Admin only (Modifications) ────────────────────────────────────────────────
router.use(restrictTo(ROLES.ADMIN));

router.patch("/:id/deliver", orderController.markDelivered);
router.patch("/:id/pay", orderController.markPaid);
router.patch("/:id", orderController.updateOrder);
router.delete("/:id", orderController.deleteOrder);

module.exports = router;
