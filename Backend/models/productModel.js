'use strict';

const mongoose = require('mongoose');
const slugify = require('slugify');
const { PRODUCT_STATUS } = require('../constants/enums');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required.'],
      trim: true,
      maxlength: [200, 'Product name must be at most 200 characters.'],
    },
    slug: { type: String, index: true },
    description: {
      type: String,
      required: [true, 'Product description is required.'],
      trim: true,
    },
    shortDescription: { type: String, trim: true, maxlength: 300 },
    price: {
      type: Number,
      required: [true, 'Product price is required.'],
      min: [0, 'Price must be non-negative.'],
    },
    priceDiscount: {
      type: Number,
      min: [0, 'Discount must be non-negative.'],
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) must be below the regular price.',
      },
    },
    finalPrice: { type: Number }, // computed in pre-save
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required.'],
      min: [0, 'Stock cannot be negative.'],
      default: 0,
    },
    sold: { type: Number, default: 0 },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category.'],
    },
    brand: { type: String, trim: true },
    images: [String],
    imageCover: { type: String, default: 'product-default.jpg' },
    tags: [String],
    attributes: { type: Map, of: String }, // flexible key/value pairs
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be at least 1.'],
      max: [5, 'Rating must be at most 5.'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.ACTIVE,
    },
    isFeatured: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// slug is indexed via index:true on the field definition — no duplicate here
productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' }); // full-text search

// ─── Virtuals ─────────────────────────────────────────────────────────────────
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

// ─── Pre-save middleware ──────────────────────────────────────────────────────
productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true, strict: true });
  this.finalPrice = this.priceDiscount ?? this.price;
  next();
});

// ─── Query middleware — populate category ─────────────────────────────────────
productSchema.pre(/^find/, function (next) {
  this.populate({ path: 'category', select: 'name slug' });
  next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
