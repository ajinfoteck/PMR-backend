const OrderOut = require("../models/Orderout");
const Product = require("../models/Product");
const OrderIn = require("../models/Orderin");
const Wastage = require("../models/wastage");
const User = require("../models/User");

// CREATE
exports.addOrderOut = async (req, res) => {
  try {let {
  orderInId,
  vendorName,
  businessType,
  items,
  paidAmount,
  paymentMethod,
  saleDate,
  saleTime,
} = req.body;

if (typeof items === "string") {
  items = JSON.parse(items);
}

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "At least one product is required",
      });
    }

    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findOne({
        name: item.productName,
      });

      if (!product) {
        return res.status(404).json({
          message: `${item.productName} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.productName}`,
        });
      }

      product.stock -= Number(item.quantity);
      await product.save();

      item.total =
        Number(item.quantity) *
        Number(item.rate);

      totalAmount += item.total;
    }

    // Find latest Order In
const lastOrderIn = await OrderIn.findOne({
  farmerName: vendorName,
}).sort({ createdAt: -1 });

// Find latest Order Out
const lastOrderOut = await OrderOut.findOne({
  vendorName,
}).sort({ createdAt: -1 });

let previousBalance = 0;

if (lastOrderOut) {
  previousBalance = lastOrderOut.balanceAmount;
} else if (lastOrderIn) {
  previousBalance = lastOrderIn.balanceAmount;
}
  const paid = Number(paidAmount) || 0;

// Previous total paid amount
let previousPaid = 0;

if (lastOrderOut) {
  previousPaid = lastOrderOut.paidAmount || 0;
} else if (lastOrderIn) {
  previousPaid = lastOrderIn.paidAmount || 0;
}

// Add current payment
const totalPaid = previousPaid + paid;

// Remaining balance
const balanceAmount = previousBalance - paid;
const image = req.file
  ? `/uploads/orders/${req.file.filename}`
  : "";
const paymentHistory = [];

if (paid > 0) {
  paymentHistory.push({
    amount: paid,
    paymentMethod,
    paymentDate: saleDate,
    paymentTime: saleTime,
  });
}

const order = await OrderOut.create({
  vendorName,
  businessType,
  items,
  totalAmount,
paidAmount: totalPaid,
  balanceAmount,
  paymentMethod,
  paymentHistory,
  saleDate,
  saleTime,
  image,
  createdBy: req.user._id,
});
await OrderIn.findByIdAndUpdate(
  orderInId,
  {
    orderOutCreated: true,
  }
);
    res.status(201).json({
      message: "Sales entry created successfully",
      order,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL
exports.getAllOrderOut = async (req, res) => {
  try {
    const orders = await OrderOut.find()
      .populate("createdBy", "name")
      .sort({
        createdAt: -1,
      });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET BY ID
exports.getOrderOutById = async (req, res) => {
  try {
    const order =
      await OrderOut.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE
exports.updateOrderOut = async (req, res) => {
  try {
    const {
      vendorName,
      businessType,
      items,
      paymentMethod,
      paidAmount,
      saleDate,
      saleTime,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "At least one product is required",
      });
    }

    const existingOrder = await OrderOut.findById(
      req.params.id
    );

    if (!existingOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findOne({
        name: item.productName,
      });

      if (!product) {
        return res.status(404).json({
          message: `${item.productName} not found`,
        });
      }

      item.total =
        Number(item.quantity) *
        Number(item.rate);

      totalAmount += item.total;
    }

    const balanceAmount =
      totalAmount -
      Number(paidAmount || 0);

    const updatedOrder =
      await OrderOut.findByIdAndUpdate(
        req.params.id,
        {
          vendorName,
          businessType,
          items,
          totalAmount,
          paidAmount,
          balanceAmount,
          paymentMethod,
          saleDate,
          saleTime,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    res.json({
      message:
        "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE
exports.deleteOrderOut = async (
  req,
  res
) => {
  try {
    await OrderOut.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.payBalance = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    const order = await OrderOut.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({
        message: "Invalid payment amount",
      });
    }

    if (paymentAmount > order.balanceAmount) {
      return res.status(400).json({
        message: "Payment cannot exceed balance",
      });
    }

    const now = new Date();

    const paymentDate = now.toISOString().split("T")[0];

    const paymentTime = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Add payment history
    order.paymentHistory.push({
      amount: paymentAmount,
      paymentMethod: paymentMethod,
      paymentDate: paymentDate,
      paymentTime: paymentTime,

      // IMPORTANT
      paidBy: req.user._id,
    });

    // Update paid amount
    order.paidAmount =
      Number(order.paidAmount || 0) + paymentAmount;

    // Update balance
    order.balanceAmount =
      Number(order.totalAmount) -
      Number(order.paidAmount);

    await order.save();

    res.status(200).json({
      message: "Payment successful",
      order,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getPaymentReport = async (req, res) => {
  try {
    const orders = await OrderOut.find()
      .select(
        "_id vendorName totalAmount paidAmount balanceAmount paymentMethod paymentHistory saleDate saleTime createdBy"
      )
      .sort({ createdAt: -1 });

    // Get all user IDs used in Order Out + payment history
    const userIds = [];

    orders.forEach((order) => {
      if (order.createdBy) {
        userIds.push(order.createdBy.toString());
      }

      order.paymentHistory.forEach((payment) => {
        if (payment.paidBy) {
          userIds.push(payment.paidBy.toString());
        }
      });
    });

    // Remove duplicate IDs
    const uniqueUserIds = [...new Set(userIds)];

    const users = await User.find({
      _id: { $in: uniqueUserIds },
    }).select("_id name");

    // Create ID -> name map
    const userMap = {};

    users.forEach((user) => {
      userMap[user._id.toString()] = user.name;
    });

    const report = orders.map((order) => {
      let runningBalance = Number(order.totalAmount) || 0;

      const laterPayments = order.paymentHistory.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0
      );

      const initialPayment =
        Number(order.paidAmount || 0) - laterPayments;

      const history = [];

      // =========================
      // INITIAL PAYMENT
      // ORDER OUT CREATOR
      // =========================

      if (initialPayment > 0) {
        runningBalance -= initialPayment;

        history.push({
          type: "Initial Payment",
          amount: initialPayment,
          paymentMethod: order.paymentMethod,

          paymentDate: order.saleDate,
          paymentTime: order.saleTime,

          paidBy: order.createdBy
            ? userMap[order.createdBy.toString()] || "Unknown"
            : "Unknown",

          balance: runningBalance,
        });
      }

      // =========================
      // BALANCE PAYMENTS
      // =========================

      order.paymentHistory.forEach((payment, index) => {
        runningBalance -= Number(payment.amount || 0);

        history.push({
          type: `Paid ${index + 1}`,
          amount: Number(payment.amount || 0),

          paymentMethod: payment.paymentMethod,

          paymentDate: payment.paymentDate,
          paymentTime: payment.paymentTime,

          paidBy: payment.paidBy
            ? userMap[payment.paidBy.toString()] || "Unknown"
            : "Unknown",

          balance: runningBalance,
        });
      });

      return {
        orderId: order._id,

        customerName: order.vendorName,

        totalAmount: Number(order.totalAmount) || 0,

        paidAmount: Number(order.paidAmount) || 0,

        balanceAmount: Number(order.balanceAmount) || 0,

        paymentHistory: history,
      };
    });

    res.json(report);
  } catch (err) {
    console.error("PAYMENT REPORT ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

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
      customerName: customerName,
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
    wastages.forEach((w) => {
      if (!summary[w.productName]) {
        summary[w.productName] = {
          productName: w.productName,
          orderIn: 0,
          orderOut: 0,
          wastage: 0,
        };
      }

      summary[w.productName].wastage += Number(w.quantity);
    });

    const result = Object.values(summary)
  .filter((p) => p.orderIn > 0 || p.orderOut > 0)
  .map((p) => ({
    productName: p.productName,
    orderIn: p.orderIn,
    orderOut: p.orderOut,
    shortage: p.orderIn - p.orderOut,
    wastage: p.wastage,
  }));

res.json(result);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const orderIns = await OrderIn.distinct("farmerName");
    const orderOuts = await OrderOut.distinct("vendorName");

    const customers = [...new Set([...orderIns, ...orderOuts])].sort();

    res.json(customers);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
// GET ALL PRODUCTS IN ORDER OUT
// GET ORDER OUT PRODUCTS BY DATE RANGE
exports.getOrderOutProducts = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};

    // Filter using createdAt only when dates are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filter.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    const orders = await OrderOut.find(filter);

    const productMap = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productMap[item.productName]) {
          productMap[item.productName] = {
            productName: item.productName,
            totalQuantity: 0,
            totalAmount: 0,
          };
        }

        productMap[item.productName].totalQuantity +=
          Number(item.quantity || 0);

        productMap[item.productName].totalAmount +=
          Number(item.total || 0);
      });
    });

    res.json({
      success: true,
      data: Object.values(productMap),
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET CUSTOMERS OF A PRODUCT
exports.getOrderOutCustomersByProduct = async (req, res) => {
  try {
    const { productName } = req.params;

    const orders = await OrderOut.find({
      "items.productName": productName,
    });

    const result = orders.map(order => {
      const item = order.items.find(
        i => i.productName === productName
      );

      return {
        customerName: order.vendorName,
        saleDate: order.saleDate,
        purchaseTime: order.purchaseTime,
        paymentMethod: order.paymentMethod,
        balanceAmount: order.balanceAmount,

        quantity: item?.quantity || 0,
        rate: item?.rate || 0,
        total: item?.total || 0,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};