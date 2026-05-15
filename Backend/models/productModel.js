'use strict';

const mongoose = require('mongoose');
const slugify = require('slugify');
const { PRODUCT_STATUS } = require('../constants/enums');
const { multilingualString, multilingualStringOptional } = require('../utils/multilingualSchema');

const productSchema = new mongoose.Schema(
  {
    name: multilingualString(true, 2, 200),
    slug: { type: String, index: true },
    description: multilingualString(true, 10),
    shortDescription: multilingualStringOptional(300),
    price: {
      type: Number,
      required: [true, 'Product price is required.'],
      min: [0, 'Price must be non-negative.'],
    },
    priceDiscount: {
      type: Number,
      min: [0, 'Discount must be non-negative.'],
    },
    discountPercent: {
      type: Number,
      min: [0, 'Discount percentage must be non-negative.'],
      max: [100, 'Discount percentage cannot exceed 100.'],
      default: 0
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
    specification: {
      type: mongoose.Schema.ObjectId,
      ref: 'Specification',
    },
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
  if (this.isModified('name')) {
    // Use English name for slug, fallback to Amharic or Afaan Oromo
    const nameForSlug = typeof this.name === 'object' 
      ? (this.name.en || this.name.am || this.name.om)
      : this.name;
    this.slug = slugify(nameForSlug, { lower: true, strict: true });
  }

  // Sync discount price if percentage is provided or changed
  if (this.isModified('price') || this.isModified('discountPercent')) {
    if (this.discountPercent && this.discountPercent > 0) {
      this.priceDiscount = Number((this.price * (1 - this.discountPercent / 100)).toFixed(2));
    } else {
      this.priceDiscount = undefined;
    }
  }

  // Always update finalPrice to match the source of truth
  this.finalPrice = this.priceDiscount ?? this.price;
  
  next();
});

// ─── Query middleware — populate category and specification ──────────────────
productSchema.pre(/^find/, function (next) {
  this.populate({ path: 'category', select: 'name slug' }).populate({
    path: 'specification',
    select: '-product -__v',
  });
  next();
});

// ─── Text search index for multilingual fields ────────────────────────────────
productSchema.index({ 
  'name.am': 'text', 
  'name.en': 'text', 
  'name.om': 'text',
  'description.am': 'text',
  'description.en': 'text',
  'description.om': 'text'
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
