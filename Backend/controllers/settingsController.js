"use strict";

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const GeneralSettings = require("../models/generalSettingsModel");
const HeroSettings = require("../models/heroSettingsModel");
const AboutSettings = require("../models/aboutSettingsModel");
const ContactSettings = require("../models/contactSettingsModel");
const SocialSettings = require("../models/socialSettingsModel");
const CommerceSettings = require("../models/commerceSettingsModel");
const PreferencesSettings = require("../models/preferencesSettingsModel");

// ─────────────────────────────────────────────────────────────────────────────
// Singleton pattern: every section document is a single record per collection.
// We use findOneAndUpdate with upsert so the record is always there, even the
// first time it is requested (no prior seed required).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Factory that creates { getSection, upsertSection } handlers for a given Model.
 * @param {import('mongoose').Model} Model
 */
const makeSettingsHandlers = (Model) => ({
  /**
   * GET — return the single settings document (create with defaults if missing).
   */
  getSection: catchAsync(async (_req, res) => {
    let doc = await Model.findOne();

    // First-time access: create a doc with schema defaults
    if (!doc) {
      doc = await Model.create({});
    }

    res.status(200).json({
      status: "success",
      data: { data: doc },
    });
  }),

  /**
   * PATCH — upsert the single settings document with the provided body fields.
   * runValidators ensures schema-level validation is applied on update.
   */
  upsertSection: catchAsync(async (req, res, next) => {
    // Prevent clients from overwriting internal Mongoose fields
    const forbidden = ["_id", "__v", "createdAt", "updatedAt"];
    forbidden.forEach((f) => delete req.body[f]);

    if (!req.body || Object.keys(req.body).length === 0) {
      return next(new AppError("Request body cannot be empty.", 400));
    }

    const doc = await Model.findOneAndUpdate(
      {}, // match the singleton
      { $set: req.body }, // apply only the provided fields
      {
        new: true, // return the updated document
        upsert: true, // create if it doesn't exist
        runValidators: true, // run schema validators on update
        setDefaultsOnInsert: true, // apply schema defaults on first insert
      },
    );

    res.status(200).json({
      status: "success",
      message: "Settings updated successfully.",
      data: { data: doc },
    });
  }),
});

// ─── Section-specific handlers ────────────────────────────────────────────────
const general = makeSettingsHandlers(GeneralSettings);
const hero = makeSettingsHandlers(HeroSettings);
const about = makeSettingsHandlers(AboutSettings);
const contact = makeSettingsHandlers(ContactSettings);
const social = makeSettingsHandlers(SocialSettings);
const commerce = makeSettingsHandlers(CommerceSettings);
const preferences = makeSettingsHandlers(PreferencesSettings);

const getEthiopianCities = catchAsync(async (req, res, next) => {
  try {
    const response = await fetch(
      "https://countriesnow.space/api/v0.1/countries/cities",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: "ethiopia" }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to reach external API");
    }

    const data = await response.json();
    res.status(200).json({
      status: "success",
      data: data.data || [],
    });
  } catch (error) {
    // Fallback if external API fails
    const fallbackCities = [
      "Addis Ababa",
      "Dire Dawa",
      "Mekelle",
      "Gondar",
      "Bahir Dar",
      "Hawassa",
      "Adama",
      "Jimma",
      "Dessie",
      "Bishoftu",
      "Shashamane",
    ];
    res.status(200).json({
      status: "success",
      data: fallbackCities,
      note: "Used fallback list",
    });
  }
});

module.exports = {
  general,
  hero,
  about,
  contact,
  social,
  commerce,
  preferences,
  getEthiopianCities,
};
