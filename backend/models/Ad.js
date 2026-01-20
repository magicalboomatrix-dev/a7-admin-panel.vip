const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema(
  {
    site: {
      type: String,
      default: "a7satta.vip", // allow per-domain ads like SEO
      index: true,
      trim: true,
      lowercase: true,
    },

    content: {
      type: String,
      default: "",
      trim: true,
    },

    position: {
      type: String,
      required: true,
      index: true, // fast filtering
    },

    order: {
      type: Number,
      default: 0,
      index: true, // fast sorting
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound indexes for faster per-site queries
AdSchema.index({ site: 1, position: 1, order: 1 });
AdSchema.index({ position: 1, order: 1 });

module.exports = mongoose.model("Ad", AdSchema);
