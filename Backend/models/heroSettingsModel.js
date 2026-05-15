"use strict";

const mongoose = require("mongoose");
const { multilingualString } = require("../utils/multilingualSchema");

const heroSlideSchema = new mongoose.Schema(
  {
    image: { type: String, trim: true, default: "" },
    title: multilingualString(false, 0, 100),
    subtitle: multilingualString(false, 0, 200),
  },
  { _id: false },
);

const heroSettingsSchema = new mongoose.Schema(
  {
    heroEyebrow: multilingualString(false, 0, 50),
    heroTitle: multilingualString(false, 0, 120),
    heroHighlight: multilingualString(false, 0, 60),
    heroSubtitle: multilingualString(false, 0, 500),
    heroCtaText: multilingualString(false, 0, 40),
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
