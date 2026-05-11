'use strict';

const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema(
  {
    icon: {
      type: String,
      required: [true, 'Feature icon is required'],
      trim: true,
      enum: {
        values: [
          'Truck',
          'Shield',
          'Zap',
          'ShieldCheck',
          'Lightbulb',
          'Rocket',
          'Handshake',
          'Users',
          'Globe',
          'Award',
          'Heart',
          'Star',
          'CheckCircle',
          'Clock',
          'Package',
          'CreditCard',
          'Headphones',
          'Lock',
          'Smartphone',
          'Laptop',
        ],
        message: '{VALUE} is not a valid icon',
      },
    },
    title: {
      type: String,
      required: [true, 'Feature title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Feature description is required'],
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
featureSchema.index({ order: 1, isActive: 1 });

const Feature = mongoose.model('Feature', featureSchema);

module.exports = Feature;
