"use strict";

const mongoose = require("mongoose");

const heroSlideSchema = new mongoose.Schema(
  {
    image: { type: String, trim: true, default: "" },
    title: { type: String, trim: true, default: "" },
    subtitle: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const heroSettingsSchema = new mongoose.Schema(
  {
    heroEyebrow: {
      type: String,
      trim: true,
      default: "NEXT-GEN ELECTRONICS",
    },
    heroTitle: {
      type: String,
      trim: true,
      maxlength: [120, "Hero title must be at most 120 characters."],
      default: "Experience The",
    },
    heroHighlight: {
      type: String,
      trim: true,
      maxlength: [60, "Hero highlight must be at most 60 characters."],
      default: "Future",
    },
    heroSubtitle: {
      type: String,
      trim: true,
      maxlength: [500, "Hero subtitle must be at most 500 characters."],
      default: "Discover cutting-edge electronics with unmatched performance.",
    },
    heroCtaText: {
      type: String,
      trim: true,
      maxlength: [40, "CTA text must be at most 40 characters."],
      default: "Shop Now",
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
