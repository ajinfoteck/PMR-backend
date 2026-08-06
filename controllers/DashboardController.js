const Product = require("../models/Product");
const OrderIn = require("../models/Orderin");
const OrderOut = require("../models/Orderout");
const Wastage = require("../models/wastage");

exports.getDashboard = async (req, res) => {
  try {

    const totalProducts = await Product.countDocuments({
      status: true
    });

    const products = await Product.find();

    const totalStock = products.reduce(
      (sum, item) => sum + (item.stock || 0),
      0
    );

    const purchases = await OrderIn.find();

    const sales = await OrderOut.find();


    const wastages = await Wastage.find();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ---------------- TOTALS ----------------

    const totalPurchase = purchases.reduce(
      (sum, item) => sum + (item.totalAmount || 0),
      0
    );

    const totalSales = sales.reduce(
      (sum, item) => sum + (item.totalAmount || 0),
      0
    );

    const totalWastage = wastages.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );

    const totalProfit =
      totalSales - totalPurchase;

    // ---------------- TODAY ----------------

    const todayPurchase = purchases
      .filter(item =>
        new Date(item.createdAt) >= today
      )
      .reduce(
        (sum, item) =>
          sum + (item.totalAmount || 0),
        0
      );

    const todaySales = sales
      .filter(item =>
        new Date(item.createdAt) >= today
      )
      .reduce(
        (sum, item) =>
          sum + (item.totalAmount || 0),
        0
      );

    const todayWastage = wastages
      .filter(item =>
        new Date(item.createdAt) >= today
      )
      .reduce(
        (sum, item) =>
          sum + (item.quantity || 0),
        0
      );

    const todayProfit =
      todaySales - todayPurchase;

    // ---------------- PENDING PAYMENT ----------------
    const pendingPurchasePayments = purchases.reduce(
  (sum, item) => sum + (item.balanceAmount || 0),
  0
);

const pendingSalesPayments = sales.reduce(
  (sum, item) => sum + (item.balanceAmount || 0),
  0
);

// ---------------- ORDERS ----------------

// Total purchase amount and sales amount
const totalOrderIn = purchases.reduce(
  (sum, order) => sum + (order.totalAmount || 0),
  0
);

const totalOrderOut = sales.reduce(
  (sum, order) => sum + (order.totalAmount || 0),
  0
);

//total order in qty
const totalOrderInQuantity = purchases.reduce((sum, order) => {
  return (
    sum +
    order.items.reduce(
      (qty, item) => qty + (item.quantity || 0),
      0
    )
  );
}, 0);

// Total order out qty
const totalOrderOutQuantity = sales.reduce((sum, order) => {
  return (
    sum +
    order.items.reduce(
      (qty, item) => qty + (item.quantity || 0),
      0
    )
  );
}, 0);

// Product-wise Order In Amount, Order Out Amount & Order Counts
const productMap = {};

// Order In
purchases.forEach(order => {
  const countedProducts = new Set();

  order.items.forEach(item => {
    if (!productMap[item.productName]) {
     productMap[item.productName] = {
  productName: item.productName,
  orderInAmount: 0,
  orderOutAmount: 0,
  orderInQuantity: 0,
  orderOutQuantity: 0,
};
    }

  productMap[item.productName].orderInAmount += Number(item.total || 0);
productMap[item.productName].orderInQuantity += Number(item.quantity || 0);
  });
});

// Order Out
sales.forEach(order => {
  const countedProducts = new Set();

  order.items.forEach(item => {
    if (!productMap[item.productName]) {
      productMap[item.productName] = {
        productName: item.productName,
        orderInAmount: 0,
        orderOutAmount: 0,
        orderInCount: 0,
        orderOutCount: 0,
      };
    }

    productMap[item.productName].orderOutAmount += Number(item.total || 0);
productMap[item.productName].orderOutQuantity += Number(item.quantity || 0);
  });
});
// Total Order Count
const totalOrderInCount = await OrderIn.countDocuments();

const totalOrderOutCount = await OrderOut.countDocuments();

// Top 4 products by sales amount
const topOrderedProducts = Object.values(productMap)
  .sort(
    (a, b) =>
      b.orderOutAmount - a.orderOutAmount
  )
  .slice(0, 4);

const totalPendingPayments =
  pendingPurchasePayments + pendingSalesPayments;

    res.status(200).json({
  success: true,
  data: {
     totalProducts,
  totalStock,

  totalPurchase,
  totalSales,
  totalWastage,
  totalProfit,

  todayPurchase,
  todaySales,
  todayWastage,
  todayProfit,

  pendingPurchasePayments,
  pendingSalesPayments,
  totalPendingPayments,

  totalOrderIn,
  totalOrderOut,
  totalOrderInQuantity,
  totalOrderOutQuantity,
  totalOrderInCount,
  totalOrderOutCount,
  topOrderedProducts
  }
});

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};