"use strict";

const mongoose = require("mongoose");
const { multilingualString } = require("../utils/multilingualSchema");

const generalSettingsSchema = new mongoose.Schema(
  {
    companyName: multilingualString(false, 2, 80),
    tagline: multilingualString(false, 2, 160),
    logoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    description: multilingualString(false, 10, 500),
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
