"use strict";

const mongoose = require("mongoose");

const aboutStatSchema = new mongoose.Schema(
  {
    value: { type: String, trim: true, default: "" },
    label: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const aboutValueSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    desc: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const aboutSettingsSchema = new mongoose.Schema(
  {
    aboutEyebrow: {
      type: String,
      trim: true,
      default: "Who We Are",
    },
    aboutTitle: {
      type: String,
      trim: true,
      maxlength: [120, "About title must be at most 120 characters."],
      default: "About",
    },
    aboutHighlight: {
      type: String,
      trim: true,
      maxlength: [60, "About highlight must be at most 60 characters."],
      default: "VoltEdge",
    },
    aboutIntro: {
      type: String,
      trim: true,
      maxlength: [1000, "About intro must be at most 1000 characters."],
      default: "",
    },
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
