'use strict';

const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
      maxlength: [500, 'Question cannot exceed 500 characters'],
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true,
      maxlength: [2000, 'Answer cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'General',
          'Shipping',
          'Returns',
          'Payment',
          'Orders',
          'Warranty',
          'Pricing',
          'Technical',
          'Account',
        ],
        message: '{VALUE} is not a valid category',
      },
      default: 'General',
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
faqSchema.index({ category: 1, order: 1, isActive: 1 });
faqSchema.index({ question: 'text', answer: 'text' });

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;
