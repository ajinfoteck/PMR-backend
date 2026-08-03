const express = require("express");
const router = express.Router();

const {protect }= require("../middleware/authMiddleware");

const customerSummaryController = require("../controllers/customerSummaryController");

router.get(
  "/customer-summary/:customerName",
  protect,
  customerSummaryController.getCustomerSummary
);



module.exports = router;