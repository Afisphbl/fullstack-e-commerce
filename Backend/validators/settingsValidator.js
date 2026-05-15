"use strict";

const { body } = require("express-validator");
const { validateMultilingualField } = require("./productValidator");

// ─── General ──────────────────────────────────────────────────────────────────
const generalRules = [
  // Multilingual fields
  ...validateMultilingualField("companyName", false, 80),
  ...validateMultilingualField("tagline", false, 160),
  ...validateMultilingualField("description", false, 500),
  
  // Non-multilingual fields
  body("logoUrl")
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_tld: false })
    .withMessage("Logo URL must be a valid URL."),
  body("enableLocationRestriction")
    .optional()
    .isBoolean()
    .withMessage("enableLocationRestriction must be a boolean."),
  body("allowedDeliveryCities")
    .optional()
    .isArray()
    .withMessage("allowedDeliveryCities must be an array of strings.")
    .custom((value) => {
      if (!Array.isArray(value)) return true;
      return value.every((item) => typeof item === "string");
    })
    .withMessage("Each city must be a string."),
];

// ─── Hero ─────────────────────────────────────────────────────────────────────
const heroRules = [
  // Multilingual fields
  ...validateMultilingualField("heroEyebrow", false, 50),
  ...validateMultilingualField("heroTitle", false, 120),
  ...validateMultilingualField("heroHighlight", false, 60),
  ...validateMultilingualField("heroSubtitle", false, 500),
  ...validateMultilingualField("heroCtaText", false, 40),
  
  // Non-multilingual fields
  body("heroCtaLink")
    .optional()
    .trim(),
  body("heroSlides")
    .optional()
    .isArray()
    .withMessage("heroSlides must be an array."),
  body("heroSlides.*.image")
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_tld: false })
    .withMessage("Each slide image must be a valid URL."),
  // Multilingual slide fields
  body("heroSlides.*.title.am").optional().trim(),
  body("heroSlides.*.title.en").optional().trim(),
  body("heroSlides.*.title.om").optional().trim(),
  body("heroSlides.*.subtitle.am").optional().trim(),
  body("heroSlides.*.subtitle.en").optional().trim(),
  body("heroSlides.*.subtitle.om").optional().trim(),
];

// ─── About ────────────────────────────────────────────────────────────────────
const aboutRules = [
  // Multilingual fields
  ...validateMultilingualField("aboutEyebrow", false, 50),
  ...validateMultilingualField("aboutTitle", false, 120),
  ...validateMultilingualField("aboutHighlight", false, 60),
  ...validateMultilingualField("aboutIntro", false, 1000),
  
  // Non-multilingual fields
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
  // Multilingual stats fields
  body("aboutStats.*.value.am").optional().trim(),
  body("aboutStats.*.value.en").optional().trim(),
  body("aboutStats.*.value.om").optional().trim(),
  body("aboutStats.*.label.am").optional().trim(),
  body("aboutStats.*.label.en").optional().trim(),
  body("aboutStats.*.label.om").optional().trim(),
  // Multilingual values fields
  body("aboutValues.*.title.am").optional().trim(),
  body("aboutValues.*.title.en").optional().trim(),
  body("aboutValues.*.title.om").optional().trim(),
  body("aboutValues.*.desc.am").optional().trim(),
  body("aboutValues.*.desc.en").optional().trim(),
  body("aboutValues.*.desc.om").optional().trim(),
];

// ─── Contact ──────────────────────────────────────────────────────────────────
const contactRules = [
  // Multilingual fields
  ...validateMultilingualField("contactAddress", false, 300),
  ...validateMultilingualField("workingHours", false, 500),
  
  // Non-multilingual fields
  body("contactEmail")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Must be a valid email address.")
    .normalizeEmail(),
  body("contactPhone").optional().trim(),
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
