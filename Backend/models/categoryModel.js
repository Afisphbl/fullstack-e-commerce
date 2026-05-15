'use strict';

const mongoose = require('mongoose');
const slugify = require('slugify');
const { multilingualString, multilingualStringOptional } = require('../utils/multilingualSchema');

const categorySchema = new mongoose.Schema(
  {
    name: multilingualString(true, 2, 100),
    slug: { type: String, index: true },
    description: multilingualStringOptional(500),
    image: String,
    parent: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      default: null,
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// slug is indexed via index:true on the field definition — no duplicate here
categorySchema.index({ parent: 1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────
categorySchema.virtual('subCategories', {
  ref: 'Category',
  foreignField: 'parent',
  localField: '_id',
});

categorySchema.virtual('products', {
  ref: 'Product',
  foreignField: 'category',
  localField: '_id',
});

// ─── Pre-save middleware ──────────────────────────────────────────────────────
categorySchema.pre('save', function (next) {
  // Use English name for slug, fallback to Amharic or Afaan Oromo
  const nameForSlug = typeof this.name === 'object' 
    ? (this.name.en || this.name.am || this.name.om)
    : this.name;
  this.slug = slugify(nameForSlug, { lower: true, strict: true });
  next();
});

// ─── Query middleware ─────────────────────────────────────────────────────────
categorySchema.pre(/^find/, function (next) {
  this.populate({ path: 'parent', select: 'name slug' });
  next();
});

// ─── Text search index for multilingual fields ────────────────────────────────
categorySchema.index({ 
  'name.am': 'text', 
  'name.en': 'text', 
  'name.om': 'text',
  'description.am': 'text',
  'description.en': 'text',
  'description.om': 'text'
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
