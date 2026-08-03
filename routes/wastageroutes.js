const express = require("express");
const uploadWastage = require("../middleware/uploadWastage");
const router = express.Router();

const wastageController = require("../controllers/WastageController");

const { protect } = require("../middleware/authMiddleware");


router.post("/", protect, uploadWastage.single("image"), wastageController.createWastage);

router.get("/", protect, wastageController.getWastages);

module.exports = router;