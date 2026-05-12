"use strict";

const mongoose = require("mongoose");

const commerceSettingsSchema = new mongoose.Schema(
  {
    taxRate: {
      type: Number,
      min: [0, "Tax rate cannot be negative."],
      max: [100, "Tax rate cannot exceed 100%."],
      default: 8,
    },
    freeShippingMin: {
      type: Number,
      min: [0, "Free shipping minimum cannot be negative."],
      default: 100,
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      minlength: [3, "Currency code must be 3 characters."],
      maxlength: [3, "Currency code must be 3 characters."],
      default: "ETB",
    },
  },
  { timestamps: true },
);

const CommerceSettings = mongoose.model(
  "CommerceSettings",
  commerceSettingsSchema,
);
module.exports = CommerceSettings;
