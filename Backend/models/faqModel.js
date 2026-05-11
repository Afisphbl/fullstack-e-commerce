const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "An FAQ must have a question"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "An FAQ must have an answer"],
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const FAQ = mongoose.model("FAQ", faqSchema);

module.exports = FAQ;
