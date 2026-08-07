const express = require("express");
const router = express.Router();

const {
  getDashboard,
  getTopOrderedProducts
} = require("../controllers/DashboardController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Dashboard
router.get("/", protect, adminOnly, getDashboard);

router.get(
  "/top-products",
  protect,
  getTopOrderedProducts
);

module.exports = router;