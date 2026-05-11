const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    siteName: { type: String, required: true, default: "VoltEdge" },
    logoUrl: { type: String, default: "" },
    faviconUrl: { type: String, default: "" },
    contactEmail: { type: String, default: "support@voltedge.com" },
    contactPhone: { type: String, default: "+1 (555) 123-4567" },
    address: { type: String, default: "123 Innovation Drive, Tech City, TC 90210" },
    socialLinks: [
      {
        platform: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    seo: {
      title: { type: String, default: "VoltEdge - Next-Gen Electronics" },
      description: { type: String, default: "Discover cutting-edge electronics with unmatched performance." },
      keywords: { type: String, default: "electronics, laptops, phones, technology" },
    },
    theme: {
      primaryColor: { type: String, default: "#3b82f6" },
      accentColor: { type: String, default: "#10b981" },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists (Singleton pattern)
settingSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.model("Setting").countDocuments();
    if (count > 0) {
      return next(new Error("Only one global settings document can exist."));
    }
  }
  next();
});

const Setting = mongoose.model("Setting", settingSchema);

module.exports = Setting;
