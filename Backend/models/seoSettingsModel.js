'use strict';

const mongoose = require('mongoose');

const seoSettingsSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: [true, 'Page identifier is required'],
      unique: true,
      enum: {
        values: ['home', 'shop', 'about', 'contact', 'faq', 'blog'],
        message: '{VALUE} is not a valid page',
      },
    },
    metaTitle: {
      type: String,
      required: [true, 'Meta title is required'],
      trim: true,
      maxlength: [60, 'Meta title should not exceed 60 characters'],
    },
    metaDescription: {
      type: String,
      required: [true, 'Meta description is required'],
      trim: true,
      maxlength: [160, 'Meta description should not exceed 160 characters'],
    },
    metaKeywords: {
      type: [String],
      default: [],
    },
    ogTitle: {
      type: String,
      trim: true,
      maxlength: [60, 'OG title should not exceed 60 characters'],
    },
    ogDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'OG description should not exceed 160 characters'],
    },
    ogImage: {
      type: String,
      default: '',
    },
    twitterCard: {
      type: String,
      enum: ['summary', 'summary_large_image', 'app', 'player'],
      default: 'summary_large_image',
    },
    canonicalUrl: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
seoSettingsSchema.index({ page: 1 });

// Auto-populate OG fields from meta fields if not provided
seoSettingsSchema.pre('save', function (next) {
  if (!this.ogTitle) {
    this.ogTitle = this.metaTitle;
  }
  if (!this.ogDescription) {
    this.ogDescription = this.metaDescription;
  }
  next();
});

const SEOSettings = mongoose.model('SEOSettings', seoSettingsSchema);

module.exports = SEOSettings;
