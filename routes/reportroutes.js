const express = require("express");

const router = express.Router();

const reportController = require("../controllers/reportsController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// Combined Reports API
router.get(
  "/",
  protect,
  adminOnly,
  reportController.getReports
);

router.get(
  "/sales",
  protect,
  reportController.getSalesReport
);


module.exports = router;