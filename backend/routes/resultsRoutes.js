const express = require("express");
const router = express.Router();

const resultsController = require("../controllers/resultsController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Route for recent results must come first

// Public: recent results
router.get("/recent", resultsController.getRecentResults);

// Routes for a specific game

// Only admin and result-manager can get, post, or delete results
router.get(
	"/:gameId",
	protect,
	authorizeRoles("admin", "result-manager"),
	resultsController.getResults
);
router.post(
	"/:gameId",
	protect,
	authorizeRoles("admin", "result-manager"),
	resultsController.postResult
);
router.delete(
	"/:gameId/:resultId",
	protect,
	authorizeRoles("admin", "result-manager"),
	resultsController.deleteResult
);

module.exports = router;
