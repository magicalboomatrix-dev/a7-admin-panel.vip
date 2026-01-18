const mongoose = require("mongoose");

const seoSchema = new mongoose.Schema({
  site: { type: String, required: true }, // NEW: site/domain identifier
  page: { type: String, required: true },
  metaTitle: { type: String, default: "" },
  metaDescription: { type: String, default: "" },
  canonical: { type: String, default: "" },
  focusKeywords: { type: [String], default: [] },
  robots: { type: String, default: "" },
  author: { type: String, default: "" },
  publisher: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
});

seoSchema.index({ site: 1, page: 1 }, { unique: true });
module.exports = mongoose.model("SEO", seoSchema);
