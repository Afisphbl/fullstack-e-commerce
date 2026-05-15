"use strict";

const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema(
  {
    name: {
      am: {
        type: String,
        required: [true, "Category name is required."],
        unique: true,
        trim: true,
        maxlength: [100, "Category name must be at most 100 characters."],
      },
      en: { type: String, trim: true, maxlength: 100 },
      om: { type: String, trim: true, maxlength: 100 },
    },
    slug: { type: String, index: true },
    description: {
      am: { type: String, trim: true },
      en: { type: String, trim: true },
      om: { type: String, trim: true },
    },
    image: String,
    parent: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      default: null,
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// slug is indexed via index:true on the field definition — no duplicate here
categorySchema.index({ parent: 1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────
categorySchema.virtual("subCategories", {
  ref: "Category",
  foreignField: "parent",
  localField: "_id",
});

categorySchema.virtual("products", {
  ref: "Product",
  foreignField: "category",
  localField: "_id",
});

// ─── Pre-save middleware ──────────────────────────────────────────────────────
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    const slugSource = this.name.en || this.name.am || "category";
    let generatedSlug = slugify(slugSource, { lower: true, strict: true });
    if (!generatedSlug) {
      generatedSlug = `category-${Math.floor(Math.random() * 1000000)}`;
    }
    this.slug = generatedSlug;
  }
  next();
});

// ─── Query middleware ─────────────────────────────────────────────────────────
categorySchema.pre(/^find/, function (next) {
  this.populate({ path: "parent", select: "name slug" });
  next();
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
