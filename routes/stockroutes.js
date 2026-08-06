const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");

router.get("/today-stock", stockController.getTodayStockSummary);

module.exports = router;