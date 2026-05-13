"use strict";

const express = require("express");
const { protect, restrictTo } = require("../middleware/auth");
const validate = require("../middleware/validate");
const ROLES = require("../constants/roles");
const ctrl = require("../controllers/settingsController");
const {
  generalRules,
  heroRules,
  aboutRules,
  contactRules,
  socialRules,
  commerceRules,
  preferencesRules,
} = require("../validators/settingsValidator");

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// Storefront-public sections — anyone can GET; only admins can PATCH
// ─────────────────────────────────────────────────────────────────────────────

// External Location Proxies
router.get("/cities", ctrl.getEthiopianCities);

// General  (/api/v1/settings/general)
router
  .route("/general")
  .get(ctrl.general.getSection)
  .patch(
    protect,
    restrictTo(ROLES.ADMIN),
    generalRules,
    validate,
    ctrl.general.upsertSection,
  );

// Hero  (/api/v1/settings/hero)
router
  .route("/hero")
  .get(ctrl.hero.getSection)
  .patch(
    protect,
    restrictTo(ROLES.ADMIN),
    heroRules,
    validate,
    ctrl.hero.upsertSection,
  );

// About  (/api/v1/settings/about)
router
  .route("/about")
  .get(ctrl.about.getSection)
  .patch(
    protect,
    restrictTo(ROLES.ADMIN),
    aboutRules,
    validate,
    ctrl.about.upsertSection,
  );

// Contact & Map  (/api/v1/settings/contact)
router
  .route("/contact")
  .get(ctrl.contact.getSection)
  .patch(
    protect,
    restrictTo(ROLES.ADMIN),
    contactRules,
    validate,
    ctrl.contact.upsertSection,
  );

// Social  (/api/v1/settings/social)
router
  .route("/social")
  .get(ctrl.social.getSection)
  .patch(
    protect,
    restrictTo(ROLES.ADMIN),
    socialRules,
    validate,
    ctrl.social.upsertSection,
  );

// ─────────────────────────────────────────────────────────────────────────────
// Admin-only sections — GET and PATCH both require admin
// ─────────────────────────────────────────────────────────────────────────────

// Commerce  (/api/v1/settings/commerce)
router
  .route("/commerce")
  .get(protect, restrictTo(ROLES.ADMIN), ctrl.commerce.getSection)
  .patch(
    protect,
    restrictTo(ROLES.ADMIN),
    commerceRules,
    validate,
    ctrl.commerce.upsertSection,
  );

// Preferences  (/api/v1/settings/preferences)
router
  .route("/preferences")
  .get(protect, restrictTo(ROLES.ADMIN), ctrl.preferences.getSection)
  .patch(
    protect,
    restrictTo(ROLES.ADMIN),
    preferencesRules,
    validate,
    ctrl.preferences.upsertSection,
  );

module.exports = router;
