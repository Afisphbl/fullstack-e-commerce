"use strict";

const mongoose = require("mongoose");

const aboutStatSchema = new mongoose.Schema(
  {
    value: { type: String, trim: true, default: "" },
    label: {
      am: { type: String, trim: true, default: "" },
      en: { type: String, trim: true, default: "" },
      om: { type: String, trim: true, default: "" },
    },
  },
  { _id: false },
);

const aboutValueSchema = new mongoose.Schema(
  {
    title: {
      am: { type: String, trim: true, default: "" },
      en: { type: String, trim: true, default: "" },
      om: { type: String, trim: true, default: "" },
    },
    desc: {
      am: { type: String, trim: true, default: "" },
      en: { type: String, trim: true, default: "" },
      om: { type: String, trim: true, default: "" },
    },
  },
  { _id: false },
);

const aboutSettingsSchema = new mongoose.Schema(
  {
    aboutEyebrow: {
      am: { type: String, trim: true, default: "Who We Are" },
      en: { type: String, trim: true, default: "Who We Are" },
      om: { type: String, trim: true, default: "Who We Are" },
    },
    aboutTitle: {
      am: { type: String, trim: true, maxlength: 120, default: "About" },
      en: { type: String, trim: true, maxlength: 120, default: "About" },
      om: { type: String, trim: true, maxlength: 120, default: "About" },
    },
    aboutHighlight: {
      am: { type: String, trim: true, maxlength: 60, default: "VoltEdge" },
      en: { type: String, trim: true, maxlength: 60, default: "VoltEdge" },
      om: { type: String, trim: true, maxlength: 60, default: "VoltEdge" },
    },
    aboutIntro: {
      am: { type: String, trim: true, maxlength: 1000, default: "" },
      en: { type: String, trim: true, maxlength: 1000, default: "" },
      om: { type: String, trim: true, maxlength: 1000, default: "" },
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
