const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  addOrderOut,
  getAllOrderOut,
  getOrderOutById,
  updateOrderOut,
  deleteOrderOut,
  payBalance,
  getPaymentReport,
  getCustomerSummary,
  getCustomers,
  getOrderOutProducts,
  getOrderOutCustomersByProduct
  
} = require("../controllers/OrderOutController");

router.post("/", protect, upload.single("image"), addOrderOut);

router.get("/", protect, getAllOrderOut);

router.get(
  "/payment-report",
  protect,
  getPaymentReport
);


router.get("/customers", protect, getCustomers);
//after clicking order out tile
router.get(
  "/products",
 protect,adminOnly,
  getOrderOutProducts
);

router.get(
  "/products/:productName",
  protect,adminOnly,
  getOrderOutCustomersByProduct
);


router.get("/:id", protect, getOrderOutById);

router.put("/:id", protect, adminOnly, updateOrderOut);

router.delete("/:id", protect, adminOnly, deleteOrderOut);

router.put(
  "/pay-balance/:id",
  protect,
  payBalance
);

router.get(
  "/customer-summary/:customerName",
  protect,
  getCustomerSummary
);

module.exports = router;
