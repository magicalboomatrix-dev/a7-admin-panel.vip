const express = require("express");
const {
  getAds,
  saveAds,
  updateAd,
  deleteAd
} = require("../controllers/adController.js");

const router = express.Router();

// =========================
// GET ads (optionally by position)
// =========================
router.get("/", getAds);

// =========================
// BULK save / update ads
// =========================
router.post("/", saveAds);

// =========================
// UPDATE single ad by ID
// =========================
router.put("/:id", updateAd);

// =========================
// DELETE single ad by ID
// =========================
router.delete("/:id", deleteAd);

module.exports = router;
