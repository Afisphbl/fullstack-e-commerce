"use strict";

const mongoose = require("mongoose");
const validator = require("validator");
const { multilingualString } = require("../utils/multilingualSchema");

const contactSettingsSchema = new mongoose.Schema(
  {
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email."],
      default: "contact@example.com",
    },
    contactPhone: {
      type: String,
      trim: true,
      default: "",
    },
    contactAddress: multilingualString(false, 0, 300),
    workingHours: multilingualString(false, 0, 500),
    mapLat: {
      type: Number,
      min: -90,
      max: 90,
      default: 37.7749,
    },
    mapLng: {
      type: Number,
      min: -180,
      max: 180,
      default: -122.4194,
    },
    mapZoom: {
      type: Number,
      min: 0,
      max: 20,
      default: 13,
    },
  },
  { timestamps: true },
);

const ContactSettings = mongoose.model(
  "ContactSettings",
  contactSettingsSchema,
);
module.exports = ContactSettings;
