"use strict";

const mongoose = require("mongoose");

const generalSettingsSchema = new mongoose.Schema(
  {
    companyName: {
      am: {
        type: String,
        trim: true,
        maxlength: 80,
        default: "VoltEdge Electronics",
      },
      en: {
        type: String,
        trim: true,
        maxlength: 80,
        default: "VoltEdge Electronics",
      },
      om: {
        type: String,
        trim: true,
        maxlength: 80,
        default: "VoltEdge Electronics",
      },
    },
    tagline: {
      am: {
        type: String,
        trim: true,
        maxlength: 160,
        default: "Next-Gen Electronics",
      },
      en: {
        type: String,
        trim: true,
        maxlength: 160,
        default: "Next-Gen Electronics",
      },
      om: {
        type: String,
        trim: true,
        maxlength: 160,
        default: "Next-Gen Electronics",
      },
    },
    logoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      am: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "Your premium destination for cutting-edge electronics.",
      },
      en: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "Your premium destination for cutting-edge electronics.",
      },
      om: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "Your premium destination for cutting-edge electronics.",
      },
    },
    enableLocationRestriction: {
      type: Boolean,
      default: false,
    },
    allowedDeliveryCities: {
      type: [String],
      default: ["Addis Ababa"],
    },
  },
  { timestamps: true },
);

const GeneralSettings = mongoose.model(
  "GeneralSettings",
  generalSettingsSchema,
);
module.exports = GeneralSettings;
