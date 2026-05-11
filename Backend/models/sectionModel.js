const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A section must have a name"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["hero", "features", "products", "cta", "testimonials", "categories"],
      required: [true, "A section must have a type"],
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // Flexible payload depending on section type
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Section = mongoose.model("Section", sectionSchema);

module.exports = Section;
