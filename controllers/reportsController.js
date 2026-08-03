const OrderIn = require("../models/Orderin");
const OrderOut = require("../models/Orderout");
const Wastage = require("../models/wastage");
const Product = require("../models/Product");

exports.getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const purchases = await OrderIn.find(filter);
    const sales = await OrderOut.find(filter);
    const wastages = await Wastage.find(filter);

    const products = await Product.find({
      status: true,
    });

    const purchaseAmount = purchases.reduce(
      (sum, item) => sum + (item.totalAmount || 0),
      0
    );

    const salesAmount = sales.reduce(
      (sum, item) => sum + (item.totalAmount || 0),
      0
    );

    const purchasePending = purchases.reduce(
      (sum, item) => sum + (item.balanceAmount || 0),
      0
    );

    const salesPending = sales.reduce(
      (sum, item) => sum + (item.balanceAmount || 0),
      0
    );

    const wastageQty = wastages.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );

    const profit = salesAmount - purchaseAmount;

    res.status(200).json({
      success: true,
      data: {
        purchaseAmount,
        salesAmount,
        profit,
        wastageQty,
        totalProducts: products.length,
        purchaseCount: purchases.length,
        salesCount: sales.length,
         purchasePending,
    salesPending,
        pendingPayments:
          purchasePending + salesPending,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



exports.getSalesReport = async (req, res) => {
  try {
    const sales = await OrderOut.find()
      .sort({ createdAt: -1 })
      .select(
        "vendorName businessType saleDate paidAmount totalAmount"
      );

    res.json(sales);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};