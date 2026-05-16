"use strict";

const mongoose = require("mongoose");
const slugify = require("slugify");
const { PRODUCT_STATUS } = require("../constants/enums");
const {
  multilingualString,
  multilingualStringOptional,
} = require("../utils/multilingualSchema");

// Helper to normalize string or multilingual object
const normalizeMultilingual = (value) => {
  if (typeof value === "string") {
    return { am: value, en: value, om: value };
  }
  if (
    value &&
    typeof value === "object" &&
    (value.am || value.en || value.om)
  ) {
    return {
      am: value.am || "",
      en: value.en || "",
      om: value.om || "",
    };
  }
  return { am: "", en: "", om: "" };
};

// Flexible multilingual schema that accepts both string and object
const flexibleMultilingualString = (
  required = false,
  minLength = 0,
  maxLength = undefined,
) => {
  return {
    type: mongoose.Schema.Types.Mixed,
    required,
    validate: {
      validator: function (value) {
        // Accept string or multilingual object
        if (typeof value === "string") {
          if (minLength && value.length < minLength) return false;
          if (maxLength && value.length > maxLength) return false;
          return true;
        }
        if (value && typeof value === "object") {
          // Check if it has at least one language field
          const hasLanguage = value.am || value.en || value.om;
          if (!hasLanguage && required) return false;

          // Validate length for each language if present
          if (value.am && minLength && value.am.length < minLength)
            return false;
          if (value.en && minLength && value.en.length < minLength)
            return false;
          if (value.om && minLength && value.om.length < minLength)
            return false;

          if (value.am && maxLength && value.am.length > maxLength)
            return false;
          if (value.en && maxLength && value.en.length > maxLength)
            return false;
          if (value.om && maxLength && value.om.length > maxLength)
            return false;

          return true;
        }
        return !required;
      },
      message: "Invalid multilingual field format",
    },
  };
};

const productSchema = new mongoose.Schema(
  {
    name: flexibleMultilingualString(true, 2, 200),
    slug: { type: String, index: true },
    description: flexibleMultilingualString(true, 10),
    shortDescription: flexibleMultilingualString(false, 0, 300),
    price: {
      type: Number,
      required: [true, "Product price is required."],
      min: [0, "Price must be non-negative."],
    },
    priceDiscount: {
      type: Number,
      min: [0, "Discount must be non-negative."],
    },
    discountPercent: {
      type: Number,
      min: [0, "Discount percentage must be non-negative."],
      max: [100, "Discount percentage cannot exceed 100."],
      default: 0,
    },
    finalPrice: { type: Number }, // computed in pre-save
    stock: {
      type: Number,
      required: [true, "Stock quantity is required."],
      min: [0, "Stock cannot be negative."],
      default: 0,
    },
    sold: { type: Number, default: 0 },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
    },
    brand: { type: String, trim: true },
    images: [String],
    imageCover: { type: String, default: "product-default.jpg" },
    tags: [String],
    attributes: { type: Map, of: String }, // flexible key/value pairs
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be at least 1."],
      max: [5, "Rating must be at most 5."],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.ACTIVE,
    },
    isFeatured: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.ObjectId, ref: "User" },
    specification: {
      type: mongoose.Schema.ObjectId,
      ref: "Specification",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// slug is indexed via index:true on the field definition — no duplicate here
productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ category: 1 });
productSchema.index({ name: "text", description: "text" }); // full-text search

// ─── Virtuals ─────────────────────────────────────────────────────────────────
productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

// ─── Pre-save middleware ──────────────────────────────────────────────────────
productSchema.pre("save", function (next) {
  // Normalize multilingual fields
  if (this.name) {
    this.name = normalizeMultilingual(this.name);
  }
  if (this.description) {
    this.description = normalizeMultilingual(this.description);
  }
  if (this.shortDescription) {
    this.shortDescription = normalizeMultilingual(this.shortDescription);
  }

  if (this.isModified("name")) {
    // Use English name for slug, fallback to Amharic or Afaan Oromo
    const nameForSlug =
      typeof this.name === "object"
        ? this.name.en || this.name.am || this.name.om
        : this.name;
    this.slug = slugify(nameForSlug, { lower: true, strict: true });
  }

  // Sync discount price if percentage is provided or changed
  if (this.isModified("price") || this.isModified("discountPercent")) {
    if (this.discountPercent && this.discountPercent > 0) {
      this.priceDiscount = Number(
        (this.price * (1 - this.discountPercent / 100)).toFixed(2),
      );
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
  this.populate({ path: "category", select: "name slug" }).populate({
    path: "specification",
    select: "-product -__v",
  });
  next();
});

// ─── Text search index for multilingual fields ────────────────────────────────
productSchema.index({
  "name.am": "text",
  "name.en": "text",
  "name.om": "text",
  "description.am": "text",
  "description.en": "text",
  "description.om": "text",
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
