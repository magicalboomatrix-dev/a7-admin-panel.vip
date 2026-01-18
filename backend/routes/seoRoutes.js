const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const seoController = require("../controllers/seoController");

// Only admin can set SEO
router.post("/set", protect, authorizeRoles("admin"), seoController.setSEO);
// Anyone can get SEO (for frontend rendering)
router.get("/get", seoController.getSEO);

module.exports = router;
