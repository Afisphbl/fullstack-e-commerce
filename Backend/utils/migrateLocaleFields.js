"use strict";

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");

// To safely migrate strings to objects without schema validation issues,
// we use the raw driver.
async function migrate() {
  try {
    if (!process.env.DATABASE_HOST) {
      console.error("No database host found in environment.");
      process.exit(1);
    }

    const uri = process.env.DATABASE_HOST.replace(
      "<db_password>",
      process.env.DB_PASSWORD,
    );
    await mongoose.connect(uri);
    console.log("Connected to database for migration.");

    // Migrate Products
    console.log("Migrating Products...");
    const products = await mongoose.connection.db
      .collection("products")
      .find({})
      .toArray();
    for (const p of products) {
      const updates = {};

      if (typeof p.name === "string")
        updates.name = { am: p.name, en: p.name, om: p.name };
      if (typeof p.description === "string")
        updates.description = {
          am: p.description,
          en: p.description,
          om: p.description,
        };
      if (typeof p.shortDescription === "string")
        updates.shortDescription = {
          am: p.shortDescription,
          en: p.shortDescription,
          om: p.shortDescription,
        };

      if (Object.keys(updates).length > 0) {
        await mongoose.connection.db
          .collection("products")
          .updateOne({ _id: p._id }, { $set: updates });
        process.stdout.write("o");
      } else {
        process.stdout.write("-");
      }
    }
    console.log("\nProducts completed.");

    // Migrate Categories
    console.log("Migrating Categories...");
    const categories = await mongoose.connection.db
      .collection("categories")
      .find({})
      .toArray();
    for (const c of categories) {
      const updates = {};
      if (typeof c.name === "string")
        updates.name = { am: c.name, en: c.name, om: c.name };
      if (typeof c.description === "string")
        updates.description = {
          am: c.description,
          en: c.description,
          om: c.description,
        };

      if (Object.keys(updates).length > 0) {
        await mongoose.connection.db
          .collection("categories")
          .updateOne({ _id: c._id }, { $set: updates });
        process.stdout.write("o");
      } else {
        process.stdout.write("-");
      }
    }
    console.log("\nCategories completed.");

    // Migrate Settings (using pluralized collection forms as stored in raw DB, lowercase)
    console.log("Migrating HeroSettings...");
    const heroSettingsList = await mongoose.connection.db
      .collection("herosettings")
      .find({})
      .toArray();
    for (const s of heroSettingsList) {
      const updates = {};
      if (typeof s.heroEyebrow === "string")
        updates.heroEyebrow = {
          am: s.heroEyebrow,
          en: s.heroEyebrow,
          om: s.heroEyebrow,
        };
      if (typeof s.heroTitle === "string")
        updates.heroTitle = {
          am: s.heroTitle,
          en: s.heroTitle,
          om: s.heroTitle,
        };
      if (typeof s.heroHighlight === "string")
        updates.heroHighlight = {
          am: s.heroHighlight,
          en: s.heroHighlight,
          om: s.heroHighlight,
        };
      if (typeof s.heroSubtitle === "string")
        updates.heroSubtitle = {
          am: s.heroSubtitle,
          en: s.heroSubtitle,
          om: s.heroSubtitle,
        };
      if (typeof s.heroCtaText === "string")
        updates.heroCtaText = {
          am: s.heroCtaText,
          en: s.heroCtaText,
          om: s.heroCtaText,
        };

      if (Array.isArray(s.heroSlides)) {
        updates.heroSlides = s.heroSlides.map((slide) => ({
          ...slide,
          title:
            typeof slide.title === "string"
              ? { am: slide.title, en: slide.title, om: slide.title }
              : slide.title,
          subtitle:
            typeof slide.subtitle === "string"
              ? { am: slide.subtitle, en: slide.subtitle, om: slide.subtitle }
              : slide.subtitle,
        }));
      }
      if (Object.keys(updates).length > 0) {
        await mongoose.connection.db
          .collection("herosettings")
          .updateOne({ _id: s._id }, { $set: updates });
      }
    }

    console.log("Migrating AboutSettings...");
    const aboutSettingsList = await mongoose.connection.db
      .collection("aboutsettings")
      .find({})
      .toArray();
    for (const s of aboutSettingsList) {
      const updates = {};
      if (typeof s.aboutEyebrow === "string")
        updates.aboutEyebrow = {
          am: s.aboutEyebrow,
          en: s.aboutEyebrow,
          om: s.aboutEyebrow,
        };
      if (typeof s.aboutTitle === "string")
        updates.aboutTitle = {
          am: s.aboutTitle,
          en: s.aboutTitle,
          om: s.aboutTitle,
        };
      if (typeof s.aboutHighlight === "string")
        updates.aboutHighlight = {
          am: s.aboutHighlight,
          en: s.aboutHighlight,
          om: s.aboutHighlight,
        };
      if (typeof s.aboutIntro === "string")
        updates.aboutIntro = {
          am: s.aboutIntro,
          en: s.aboutIntro,
          om: s.aboutIntro,
        };

      if (Array.isArray(s.aboutStats)) {
        updates.aboutStats = s.aboutStats.map((stat) => ({
          ...stat,
          label:
            typeof stat.label === "string"
              ? { am: stat.label, en: stat.label, om: stat.label }
              : stat.label,
        }));
      }
      if (Array.isArray(s.aboutValues)) {
        updates.aboutValues = s.aboutValues.map((val) => ({
          ...val,
          title:
            typeof val.title === "string"
              ? { am: val.title, en: val.title, om: val.title }
              : val.title,
          desc:
            typeof val.desc === "string"
              ? { am: val.desc, en: val.desc, om: val.desc }
              : val.desc,
        }));
      }
      if (Object.keys(updates).length > 0) {
        await mongoose.connection.db
          .collection("aboutsettings")
          .updateOne({ _id: s._id }, { $set: updates });
      }
    }

    console.log("Migrating GeneralSettings...");
    const generalSettingsList = await mongoose.connection.db
      .collection("generalsettings")
      .find({})
      .toArray();
    for (const s of generalSettingsList) {
      const updates = {};
      if (typeof s.companyName === "string")
        updates.companyName = {
          am: s.companyName,
          en: s.companyName,
          om: s.companyName,
        };
      if (typeof s.tagline === "string")
        updates.tagline = { am: s.tagline, en: s.tagline, om: s.tagline };
      if (typeof s.description === "string")
        updates.description = {
          am: s.description,
          en: s.description,
          om: s.description,
        };

      if (Object.keys(updates).length > 0) {
        await mongoose.connection.db
          .collection("generalsettings")
          .updateOne({ _id: s._id }, { $set: updates });
      }
    }

    console.log("Migration finished successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
