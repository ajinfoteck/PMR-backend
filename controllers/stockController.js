const Product = require("../models/Product");
const OrderIn = require("../models/Orderin");
const OrderOut = require("../models/Orderout");

exports.getTodayStockSummary = async (req, res) => {
  try {
    const products = await Product.find({ status: true }).sort({ createdAt: -1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orderIns = await OrderIn.find({
      createdAt: { $gte: today },
    });

    const orderOuts = await OrderOut.find({
      createdAt: { $gte: today },
    });

    const result = products.map(product => {
      let orderInQty = 0;
      let orderOutQty = 0;

      orderIns.forEach(order => {
        order.items.forEach(item => {
          if (item.productName === product.name) {
            orderInQty += Number(item.quantity || 0);
          }
        });
      });

      orderOuts.forEach(order => {
        order.items.forEach(item => {
          if (item.productName === product.name) {
            orderOutQty += Number(item.quantity || 0);
          }
        });
      });

      return {
        productName: product.name,
        unit: product.unit,
        orderInQuantity: orderInQty,
        orderOutQuantity: orderOutQty,
      };
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};