const express = require("express");

const router = express.Router();

const {
  addOrderIn,
  getAllOrderIn,
  getOrderInById,
  updateOrderIn,
  deleteOrderIn,
  getOrderInProducts,
  getOrderInProductDetails
} = require("../controllers/OrderInController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, addOrderIn);

router.get("/", protect, getAllOrderIn);


//inside after clicking the tile
router.get(
  "/products",
   protect,adminOnly,
  getOrderInProducts
);

router.get(
  "/products/:productName",
   protect,adminOnly,
  getOrderInProductDetails
);


router.get("/:id", protect, getOrderInById);

router.put("/:id", protect,adminOnly, updateOrderIn);

router.delete("/:id", protect,deleteOrderIn);

const upload = require("../middleware/upload");

router.post("/", protect, upload.single("image"), addOrderIn);


module.exports = router;
