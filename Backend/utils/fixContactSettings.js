'use strict';

/**
 * Fix invalid contact settings email
 * Run with: node utils/fixContactSettings.js
 */

require('../config/env');
const mongoose = require('mongoose');
const ContactSettings = require('../models/contactSettingsModel');

const fixContactSettings = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.DATABASE_HOST);
    console.log('✅ Connected to database');

    // Find and update the contact settings
    const result = await ContactSettings.findOneAndUpdate(
      { contactEmail: '[EMAIL_ADDRESS]' }, // Find invalid email
      { contactEmail: 'contact@example.com' }, // Replace with valid email
      { new: true, runValidators: true }
    );

    if (result) {
      console.log('✅ Fixed contact settings email:', result.contactEmail);
    } else {
      console.log('ℹ️  No invalid contact settings found. Checking if document exists...');
      
      const doc = await ContactSettings.findOne();
      if (doc) {
        console.log('✅ Contact settings already valid:', doc.contactEmail);
      } else {
        console.log('ℹ️  No contact settings document exists yet. It will be created on first access.');
      }
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixContactSettings();
