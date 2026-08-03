const express = require("express");
const router = express.Router();

const productController = require("../controllers/ProductController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, productController.createProduct);

router.get("/", protect, productController.getProducts);

router.get("/:id", protect, productController.getProductById);

router.put("/:id", protect, productController.updateProduct);

router.delete("/:id", protect, productController.deleteProduct);

module.exports = router;