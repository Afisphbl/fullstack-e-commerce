'use strict';

const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    // Branding
    siteName: {
      type: String,
      required: [true, 'Site name is required'],
      default: 'VOLTEDGE',
      trim: true,
    },
    siteTagline: {
      type: String,
      default: 'Your premium destination for cutting-edge electronics. Experience the future today.',
      trim: true,
    },
    siteLogo: {
      type: String,
      default: '',
    },
    siteFavicon: {
      type: String,
      default: '',
    },

    // Contact Information
    contactEmail: {
      type: String,
      default: 'support@voltedge.com',
      lowercase: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      default: '+1 (555) 123-4567',
      trim: true,
    },
    contactAddress: {
      type: String,
      default: 'San Francisco, CA',
      trim: true,
    },

    // Map
    mapLatitude: {
      type: Number,
      default: 9.7719357,
    },
    mapLongitude: {
      type: Number,
      default: 38.7388875,
    },
    mapEmbedUrl: {
      type: String,
      default: 'https://www.google.com/maps?q=9.7719357,38.7388875&output=embed',
    },

    // Working Hours
    workingHours: {
      monday: { type: String, default: '9:00 AM - 8:00 PM' },
      tuesday: { type: String, default: '9:00 AM - 8:00 PM' },
      wednesday: { type: String, default: '9:00 AM - 8:00 PM' },
      thursday: { type: String, default: '9:00 AM - 8:00 PM' },
      friday: { type: String, default: '9:00 AM - 8:00 PM' },
      saturday: { type: String, default: '10:00 AM - 6:00 PM' },
      sunday: { type: String, default: '11:00 AM - 4:00 PM' },
    },

    // Footer
    footerText: {
      type: String,
      default: 'Your premium destination for cutting-edge electronics. Experience the future today.',
    },
    copyrightText: {
      type: String,
      default: '© 2026 VoltEdge. All rights reserved.',
    },

    // Metadata
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Singleton pattern - only one settings document
siteSettingsSchema.statics.getInstance = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Prevent multiple documents
siteSettingsSchema.pre('save', async function (next) {
  const count = await this.constructor.countDocuments();
  if (count > 0 && this.isNew) {
    const error = new Error('Only one site settings document is allowed');
    return next(error);
  }
  next();
});

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

module.exports = SiteSettings;
