"use strict";

const mongoose = require("mongoose");
const { multilingualString } = require("../utils/multilingualSchema");

const aboutStatSchema = new mongoose.Schema(
  {
    value: multilingualString(false, 0, 50),
    label: multilingualString(false, 0, 100),
  },
  { _id: false },
);

const aboutValueSchema = new mongoose.Schema(
  {
    title: multilingualString(false, 0, 100),
    desc: multilingualString(false, 0, 300),
  },
  { _id: false },
);

const aboutSettingsSchema = new mongoose.Schema(
  {
    aboutEyebrow: multilingualString(false, 0, 50),
    aboutTitle: multilingualString(false, 0, 120),
    aboutHighlight: multilingualString(false, 0, 60),
    aboutIntro: multilingualString(false, 0, 1000),
    aboutImage: {
      type: String,
      trim: true,
      default: "",
    },
    aboutStats: {
      type: [aboutStatSchema],
      default: [],
    },
    aboutValues: {
      type: [aboutValueSchema],
      default: [],
    },
  },
  { timestamps: true },
);

const AboutSettings = mongoose.model("AboutSettings", aboutSettingsSchema);
module.exports = AboutSettings;
