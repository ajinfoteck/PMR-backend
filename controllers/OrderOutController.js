const OrderOut = require("../models/Orderout");
const Product = require("../models/Product");
const OrderIn = require("../models/Orderin");
const Wastage = require("../models/wastage");

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
    const {
      amount,
      paymentMethod,
    } = req.body;

    console.log(req.body);
console.log("Payment Method:", paymentMethod);

    const order = await OrderOut.findById(req.params.id);
  

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const payAmount = Number(amount);

    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({
        message: "Invalid payment amount",
      });
    }

    if (payAmount > order.balanceAmount) {
      return res.status(400).json({
        message: "Payment amount exceeds balance",
      });
    }

    // Update totals
    order.paidAmount += payAmount;
    order.balanceAmount -= payAmount;

    const now = new Date();

const currentDate = now.toISOString().split("T")[0];

const currentTime = now.toLocaleTimeString("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

    // Save payment history
    order.paymentHistory.push({
      amount: payAmount,
       paymentMethod: paymentMethod,  
       paymentDate: currentDate,
       paymentTime: currentTime,
    });

    await order.save();

    res.json({
      message: "Payment added successfully",
      order,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getPaymentReport = async (req, res) => {
  try {
    const orders = await OrderOut.find()
      .select(
  "vendorName totalAmount paidAmount balanceAmount paymentMethod paymentHistory saleDate saleTime"
)
      .sort({ createdAt: -1 });

    const report = orders.map((order) => {

      let runningBalance = order.totalAmount;

      // Sum of later payments
      const laterPayments = order.paymentHistory.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );

      // Initial payment at order creation
      const initialPayment = order.paidAmount - laterPayments;

      const history = [];

      if (initialPayment > 0) {
        runningBalance -= initialPayment;

        history.push({
          type: "Initial Payment",
          amount: initialPayment,
          paymentMethod: order.paymentMethod,
          paymentDate: order.saleDate,
          paymentTime: order.saleTime,
          balance: runningBalance,
        });
      }

      order.paymentHistory.forEach((payment, index) => {
        runningBalance -= Number(payment.amount);

        history.push({
          type: `Paid ${index + 1}`,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          paymentDate: payment.paymentDate,
          paymentTime: payment.paymentTime,
          balance: runningBalance,
        });
      });

      return {
        orderId: order._id,
        customerName: order.vendorName,
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount,
        balanceAmount: order.balanceAmount,
        paymentHistory: history,
      };
    });

    res.json(report);

  } catch (err) {
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