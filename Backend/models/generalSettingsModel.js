"use strict";

const mongoose = require("mongoose");

const generalSettingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      trim: true,
      maxlength: [80, "Company name must be at most 80 characters."],
      default: "VoltEdge Electronics",
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: [160, "Tagline must be at most 160 characters."],
      default: "Next-Gen Electronics",
    },
    logoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must be at most 500 characters."],
      default: "Your premium destination for cutting-edge electronics.",
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
