'use strict';

const mongoose = require('mongoose');
const { multilingualString } = require('../utils/multilingualSchema');

// Helper to normalize string or multilingual object
const normalizeMultilingual = (value) => {
  if (typeof value === 'string') {
    return { am: value, en: value, om: value };
  }
  if (value && typeof value === 'object' && (value.am || value.en || value.om)) {
    return {
      am: value.am || '',
      en: value.en || '',
      om: value.om || '',
    };
  }
  return { am: '', en: '', om: '' };
};

// Flexible multilingual schema that accepts both string and object
const flexibleMultilingualString = (required = false, minLength = 0, maxLength = undefined) => {
  return {
    type: mongoose.Schema.Types.Mixed,
    required,
    validate: {
      validator: function(value) {
        // Accept string or multilingual object
        if (typeof value === 'string') {
          if (minLength && value.length < minLength) return false;
          if (maxLength && value.length > maxLength) return false;
          return true;
        }
        if (value && typeof value === 'object') {
          // Check if it has at least one language field
          const hasLanguage = value.am || value.en || value.om;
          if (!hasLanguage && required) return false;
          
          // Validate length for each language if present
          if (value.am && minLength && value.am.length < minLength) return false;
          if (value.en && minLength && value.en.length < minLength) return false;
          if (value.om && minLength && value.om.length < minLength) return false;
          
          if (value.am && maxLength && value.am.length > maxLength) return false;
          if (value.en && maxLength && value.en.length > maxLength) return false;
          if (value.om && maxLength && value.om.length > maxLength) return false;
          
          return true;
        }
        return !required;
      },
      message: 'Invalid multilingual field format',
    },
  };
};

const specificationSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Specification must belong to a product.'],
      unique: true,
    },
    details: [
      {
        group: flexibleMultilingualString(true, 2, 100),
        specs: [
          {
            name: flexibleMultilingualString(true, 2, 100),
            value: {
              type: String,
              required: [true, 'Specification value is required.'],
              trim: true,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook to normalize multilingual fields
specificationSchema.pre('save', function(next) {
  if (this.details && Array.isArray(this.details)) {
    this.details = this.details.map(detail => {
      const normalized = {
        group: normalizeMultilingual(detail.group),
        specs: detail.specs.map(spec => ({
          name: normalizeMultilingual(spec.name),
          value: spec.value,
        })),
      };
      return normalized;
    });
  }
  next();
});

// Specification is already indexed via the 'unique: true' constraint on the 'product' field.

const Specification = mongoose.model('Specification', specificationSchema);

module.exports = Specification;
