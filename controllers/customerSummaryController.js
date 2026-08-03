const OrderIn = require("../models/Orderin");
const OrderOut = require("../models/Orderout");
const Wastage = require("../models/wastage");
exports.getCustomerSummary = async (req, res) => {
  try {
    const customerName = req.params.customerName;

    const orderIns = await OrderIn.find({
      farmerName: customerName,
    });

    const orderOuts = await OrderOut.find({
      vendorName: customerName,
    });

    const wastages = await Wastage.find({
      customerName,
    });

    const summary = {};

    // Order In
    orderIns.forEach((order) => {
      order.items.forEach((item) => {
        if (!summary[item.productName]) {
          summary[item.productName] = {
            productName: item.productName,
            orderIn: 0,
            orderOut: 0,
            wastage: 0,
          };
        }

        summary[item.productName].orderIn += Number(item.quantity);
      });
    });

    // Order Out
    orderOuts.forEach((order) => {
      order.items.forEach((item) => {
        if (!summary[item.productName]) {
          summary[item.productName] = {
            productName: item.productName,
            orderIn: 0,
            orderOut: 0,
            wastage: 0,
          };
        }

        summary[item.productName].orderOut += Number(item.quantity);
      });
    });

    // Wastage
    wastages.forEach((waste) => {
      if (!summary[waste.productName]) {
        summary[waste.productName] = {
          productName: waste.productName,
          orderIn: 0,
          orderOut: 0,
          wastage: 0,
        };
      }

      summary[waste.productName].wastage += Number(waste.quantity);
    });

    res.json({
      products: Object.values(summary).map((p) => ({
        productName: p.productName,
        orderIn: p.orderIn,
        orderOut: p.orderOut,
        shortage: p.orderIn - p.orderOut,
        wastage: p.wastage,
      })),

      orderOutImage:
        orderOuts.length > 0 ? orderOuts[0].image : "",

      wastageImage:
        wastages.length > 0 ? wastages[0].image : "",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};