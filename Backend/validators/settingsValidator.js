"use strict";

const { body } = require("express-validator");

// ─── General ──────────────────────────────────────────────────────────────────
const generalRules = [
  body("companyName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Company name cannot be blank.")
    .isLength({ max: 80 })
    .withMessage("Company name must be at most 80 characters."),
  body("tagline")
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage("Tagline must be at most 160 characters."),
  body("logoUrl")
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_tld: false })
    .withMessage("Logo URL must be a valid URL."),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must be at most 500 characters."),
  body("enableLocationRestriction")
    .optional()
    .isBoolean()
    .withMessage("enableLocationRestriction must be a boolean."),
  body("allowedDeliveryCities")
    .optional()
    .isArray()
    .withMessage("allowedDeliveryCities must be an array of strings."),
];

// ─── Hero ─────────────────────────────────────────────────────────────────────
const heroRules = [
  body("heroTitle")
    .optional()
    .trim()
    .isLength({ max: 120 })
    .withMessage("Hero title must be at most 120 characters."),
  body("heroHighlight")
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage("Hero highlight must be at most 60 characters."),
  body("heroSubtitle")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Hero subtitle must be at most 500 characters."),
  body("heroCtaText")
    .optional()
    .trim()
    .isLength({ max: 40 })
    .withMessage("CTA text must be at most 40 characters."),
  body("heroSlides")
    .optional()
    .isArray()
    .withMessage("heroSlides must be an array."),
  body("heroSlides.*.image")
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_tld: false })
    .withMessage("Each slide image must be a valid URL."),
];

// ─── About ────────────────────────────────────────────────────────────────────
const aboutRules = [
  body("aboutTitle")
    .optional()
    .trim()
    .isLength({ max: 120 })
    .withMessage("About title must be at most 120 characters."),
  body("aboutHighlight")
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage("About highlight must be at most 60 characters."),
  body("aboutIntro")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("About intro must be at most 1000 characters."),
  body("aboutImage")
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_tld: false })
    .withMessage("About image must be a valid URL."),
  body("aboutStats")
    .optional()
    .isArray()
    .withMessage("aboutStats must be an array."),
  body("aboutValues")
    .optional()
    .isArray()
    .withMessage("aboutValues must be an array."),
];

// ─── Contact ──────────────────────────────────────────────────────────────────
const contactRules = [
  body("contactEmail")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Must be a valid email address.")
    .normalizeEmail(),
  body("contactPhone").optional().trim(),
  body("contactAddress")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Address must be at most 300 characters."),
  body("workingHours")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Working hours must be at most 500 characters."),
  body("mapLat")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Map latitude must be between -90 and 90."),
  body("mapLng")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Map longitude must be between -180 and 180."),
  body("mapZoom")
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage("Map zoom must be an integer between 0 and 20."),
];

// ─── Social ───────────────────────────────────────────────────────────────────
const socialRules = [
  body("facebook")
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_tld: false })
    .withMessage("Facebook must be a valid URL."),
  body("instagram")
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_tld: false })
    .withMessage("Instagram must be a valid URL."),
  body("twitter")
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_tld: false })
    .withMessage("Twitter must be a valid URL."),
  body("linkedin")
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_tld: false })
    .withMessage("LinkedIn must be a valid URL."),
  body("youtube")
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_tld: false })
    .withMessage("YouTube must be a valid URL."),
  body("custom").optional().isArray().withMessage("custom must be an array."),
  body("custom.*.platform").optional().trim(),
  body("custom.*.url")
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_tld: false })
    .withMessage("Custom URL must be a valid URL."),
];

// ─── Commerce ─────────────────────────────────────────────────────────────────
const commerceRules = [
  body("taxRate")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Tax rate must be a number between 0 and 100."),
  body("freeShippingMin")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Free shipping minimum must be a non-negative number."),
  body("currency")
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-character code (e.g. USD).")
    .isAlpha()
    .withMessage("Currency code must contain only letters."),
];

// ─── Preferences ──────────────────────────────────────────────────────────────
const preferencesRules = [
  body("maintenanceMode")
    .optional()
    .isBoolean()
    .withMessage("maintenanceMode must be true or false."),
  body("emailNotifications")
    .optional()
    .isBoolean()
    .withMessage("emailNotifications must be true or false."),
];

module.exports = {
  generalRules,
  heroRules,
  aboutRules,
  contactRules,
  socialRules,
  commerceRules,
  preferencesRules,
};
