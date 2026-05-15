"use strict";

const mongoose = require("mongoose");

const heroSlideSchema = new mongoose.Schema(
  {
    image: { type: String, trim: true, default: "" },
    title: {
      am: { type: String, trim: true, default: "" },
      en: { type: String, trim: true, default: "" },
      om: { type: String, trim: true, default: "" },
    },
    subtitle: {
      am: { type: String, trim: true, default: "" },
      en: { type: String, trim: true, default: "" },
      om: { type: String, trim: true, default: "" },
    },
  },
  { _id: false },
);

const heroSettingsSchema = new mongoose.Schema(
  {
    heroEyebrow: {
      am: { type: String, trim: true, default: "NEXT-GEN ELECTRONICS" },
      en: { type: String, trim: true, default: "NEXT-GEN ELECTRONICS" },
      om: { type: String, trim: true, default: "NEXT-GEN ELECTRONICS" },
    },
    heroTitle: {
      am: {
        type: String,
        trim: true,
        maxlength: 120,
        default: "Experience The",
      },
      en: {
        type: String,
        trim: true,
        maxlength: 120,
        default: "Experience The",
      },
      om: {
        type: String,
        trim: true,
        maxlength: 120,
        default: "Experience The",
      },
    },
    heroHighlight: {
      am: { type: String, trim: true, maxlength: 60, default: "Future" },
      en: { type: String, trim: true, maxlength: 60, default: "Future" },
      om: { type: String, trim: true, maxlength: 60, default: "Future" },
    },
    heroSubtitle: {
      am: {
        type: String,
        trim: true,
        maxlength: 500,
        default:
          "Discover cutting-edge electronics with unmatched performance.",
      },
      en: {
        type: String,
        trim: true,
        maxlength: 500,
        default:
          "Discover cutting-edge electronics with unmatched performance.",
      },
      om: {
        type: String,
        trim: true,
        maxlength: 500,
        default:
          "Discover cutting-edge electronics with unmatched performance.",
      },
    },
    heroCtaText: {
      am: { type: String, trim: true, maxlength: 40, default: "Shop Now" },
      en: { type: String, trim: true, maxlength: 40, default: "Shop Now" },
      om: { type: String, trim: true, maxlength: 40, default: "Shop Now" },
    },
    heroCtaLink: {
      type: String,
      trim: true,
      default: "/shop",
    },
    heroSlides: {
      type: [heroSlideSchema],
      default: [],
    },
  },
  { timestamps: true },
);

const HeroSettings = mongoose.model("HeroSettings", heroSettingsSchema);
module.exports = HeroSettings;
