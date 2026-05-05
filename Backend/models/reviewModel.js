'use strict';

const mongoose = require('mongoose');
const Product = require('./productModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review text is required.'],
      trim: true,
      minlength: [10, 'Review must be at least 10 characters.'],
      maxlength: [1000, 'Review must be at most 1000 characters.'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required.'],
      min: [1, 'Rating must be at least 1.'],
      max: [5, 'Rating must be at most 5.'],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Compound index — one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// ─── Query middleware — always populate user ──────────────────────────────────
reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name photo' });
  next();
});

// ─── Static: recalculate product rating stats ─────────────────────────────────
reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// ─── Post-save: recalculate after create ─────────────────────────────────────
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.product);
});

// ─── Pre-find (for update/delete hooks): store current doc ───────────────────
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this._docBeforeUpdate = await this.model.findOne(this.getQuery());
  next();
});

// ─── Post-find: recalculate after update/delete ───────────────────────────────
reviewSchema.post(/^findOneAnd/, async function () {
  if (this._docBeforeUpdate) {
    await this._docBeforeUpdate.constructor.calcAverageRatings(
      this._docBeforeUpdate.product
    );
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
