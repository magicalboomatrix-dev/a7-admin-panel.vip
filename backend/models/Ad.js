const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema(
  {
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

// Compound index for blazing fast queries
AdSchema.index({ position: 1, order: 1 });

module.exports = mongoose.model("Ad", AdSchema);
