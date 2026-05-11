'use strict';

const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Slide title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    subtitle: {
      type: String,
      required: [true, 'Slide subtitle is required'],
      trim: true,
      maxlength: [200, 'Subtitle cannot exceed 200 characters'],
    },
    image: {
      type: String,
      required: [true, 'Slide image is required'],
    },
    buttonText: {
      type: String,
      default: 'Shop Now',
      trim: true,
      maxlength: [50, 'Button text cannot exceed 50 characters'],
    },
    buttonLink: {
      type: String,
      default: '/shop',
      trim: true,
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
heroSlideSchema.index({ order: 1, isActive: 1 });

// Virtual for slide position
heroSlideSchema.virtual('position').get(function () {
  return this.order + 1;
});

const HeroSlide = mongoose.model('HeroSlide', heroSlideSchema);

module.exports = HeroSlide;
