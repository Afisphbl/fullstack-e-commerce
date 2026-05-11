'use strict';

const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: {
        values: ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'pinterest'],
        message: '{VALUE} is not a valid platform',
      },
      unique: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Please provide a valid URL',
      },
    },
    icon: {
      type: String,
      default: function () {
        const iconMap = {
          facebook: 'Facebook',
          instagram: 'Instagram',
          twitter: 'Twitter',
          linkedin: 'Linkedin',
          youtube: 'Youtube',
          tiktok: 'Music',
          pinterest: 'Pin',
        };
        return iconMap[this.platform] || 'Link';
      },
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
socialLinkSchema.index({ order: 1, isActive: 1 });

const SocialLink = mongoose.model('SocialLink', socialLinkSchema);

module.exports = SocialLink;
