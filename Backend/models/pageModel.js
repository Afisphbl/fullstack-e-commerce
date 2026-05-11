const mongoose = require("mongoose");
const slugify = require("slugify");

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A page must have a title"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      default: "",
    },
    seoTitle: {
      type: String,
    },
    seoDescription: {
      type: String,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    template: {
      type: String,
      enum: ["standard", "policy", "contact", "about"],
      default: "standard",
    },
  },
  {
    timestamps: true,
  }
);

pageSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

const Page = mongoose.model("Page", pageSchema);

module.exports = Page;
