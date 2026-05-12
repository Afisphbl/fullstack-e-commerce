"use strict";

const mongoose = require("mongoose");

const customSocialSchema = new mongoose.Schema(
  {
    platform: { type: String, trim: true, default: "" },
    url: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const socialSettingsSchema = new mongoose.Schema(
  {
    facebook: { type: String, trim: true, default: "" },
    instagram: { type: String, trim: true, default: "" },
    twitter: { type: String, trim: true, default: "" },
    linkedin: { type: String, trim: true, default: "" },
    youtube: { type: String, trim: true, default: "" },
    custom: { type: [customSocialSchema], default: [] },
  },
  { timestamps: true },
);

const SocialSettings = mongoose.model("SocialSettings", socialSettingsSchema);
module.exports = SocialSettings;
