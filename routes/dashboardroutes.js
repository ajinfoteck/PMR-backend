const express = require("express");
const router = express.Router();

const {
  getDashboard
} = require("../controllers/DashboardController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Dashboard
router.get("/", protect, adminOnly, getDashboard);

module.exports = router;