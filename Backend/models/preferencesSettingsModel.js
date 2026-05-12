"use strict";

const mongoose = require("mongoose");

const preferencesSettingsSchema = new mongoose.Schema(
  {
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const PreferencesSettings = mongoose.model(
  "PreferencesSettings",
  preferencesSettingsSchema,
);
module.exports = PreferencesSettings;
