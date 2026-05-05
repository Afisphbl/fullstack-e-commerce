'use strict';

const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required.'],
      unique: true,
      trim: true,
      maxlength: [100, 'Category name must be at most 100 characters.'],
    },
    slug: { type: String, index: true },
    description: { type: String, trim: true },
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
  this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

// ─── Query middleware ─────────────────────────────────────────────────────────
categorySchema.pre(/^find/, function (next) {
  this.populate({ path: 'parent', select: 'name slug' });
  next();
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
