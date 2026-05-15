'use strict';

const mongoose = require('mongoose');
const { multilingualString } = require('../utils/multilingualSchema');

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
        group: multilingualString(true, 2, 100),
        specs: [
          {
            name: multilingualString(true, 2, 100),
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

// Specification is already indexed via the 'unique: true' constraint on the 'product' field.

const Specification = mongoose.model('Specification', specificationSchema);

module.exports = Specification;
