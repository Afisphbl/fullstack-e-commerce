"use strict";

const mongoose = require("mongoose");

const contactSettingsSchema = new mongoose.Schema(
  {
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address."],
      default: "support@voltedge.com",
    },
    contactPhone: {
      type: String,
      trim: true,
      default: "",
    },
    contactAddress: {
      type: String,
      trim: true,
      maxlength: [300, "Address must be at most 300 characters."],
      default: "",
    },
    workingHours: {
      type: String,
      trim: true,
      maxlength: [500, "Working hours must be at most 500 characters."],
      default: "",
    },
    mapLat: {
      type: String,
      trim: true,
      default: "37.7749",
    },
    mapLng: {
      type: String,
      trim: true,
      default: "-122.4194",
    },
    mapZoom: {
      type: String,
      trim: true,
      default: "13",
    },
  },
  { timestamps: true },
);

const ContactSettings = mongoose.model(
  "ContactSettings",
  contactSettingsSchema,
);
module.exports = ContactSettings;
