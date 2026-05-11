'use strict';

require('../config/env');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const logger = require('../logs/logger');

const Setting = require('../models/settingModel');
const Page = require('../models/pageModel');
const Section = require('../models/sectionModel');
const FAQ = require('../models/faqModel');

const connectDB = async () => {
  const uri = process.env.DATABASE_HOST.replace('<db_password>', process.env.DB_PASSWORD);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  logger.info('MongoDB connected for CMS seeding.');
};

const fixturesDir = path.join(__dirname, '..', 'data');
const loadJSON = (filename) => {
  const filePath = path.join(fixturesDir, filename);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const seedCMS = async () => {
  try {
    const settings = loadJSON('settings.json');
    const pages = loadJSON('pages.json');
    const sections = loadJSON('sections.json');
    const faqs = loadJSON('faqs.json');

    if (settings) {
      const count = await Setting.countDocuments();
      if (count === 0) await Setting.create(settings, { validateBeforeSave: false });
    }
    
    // Clear old CMS data
    await Page.deleteMany();
    await Section.deleteMany();
    await FAQ.deleteMany();

    if (pages) await Page.create(pages, { validateBeforeSave: false });
    if (sections) await Section.create(sections, { validateBeforeSave: false });
    if (faqs) await FAQ.create(faqs, { validateBeforeSave: false });

    logger.info('✅ CMS Data imported successfully.');
  } catch (err) {
    logger.error(`CMS Import failed: ${err.message}`);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

(async () => {
  await connectDB();
  await seedCMS();
})();
