const OrderIn = require("../models/Orderin");
const Product = require("../models/Product");
const Counter = require("../models/Counter");

// CREATE

exports.addOrderIn = async (req, res) => {
  try {
    const {
      farmerName,
      businessType,
      items,
      paidAmount,
      paymentMethod,
      purchaseDate,
      purchaseTime,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "At least one product is required",
      });
    }

    let totalAmount = 0;

    for (const item of items) {
      item.total =
        Number(item.quantity) *
        Number(item.rate);

      totalAmount += item.total;

      const product = await Product.findOne({
        name: item.productName,
      });

      if (product) {
        product.stock += Number(item.quantity);
        await product.save();
      }
    }

    const balanceAmount =
      totalAmount -
      Number(paidAmount || 0);

    const image = req.file
      ? req.file.filename
      : "";

    const invoiceNo =
      await getNextInvoiceNumber();

    const order = await OrderIn.create({
      invoiceNo,
      farmerName,
      businessType,
      items,
      totalAmount,
      paidAmount,
      balanceAmount,
      paymentMethod,
      purchaseDate,
      purchaseTime,
      image,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message:
        "Purchase entry created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL
exports.getAllOrderIn =
  async (req, res) => {
    try {
      const orders =
        await OrderIn.find()
          .populate(
            "createdBy",
            "name"
          )
          .sort({
            createdAt: -1,
          });

      res.json(orders);
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

// GET BY ID
exports.getOrderInById =
  async (req, res) => {
    try {
      const order =
        await OrderIn.findById(
          req.params.id
        );

      if (!order) {
        return res
          .status(404)
          .json({
            message:
              "Order not found",
          });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

// UPDATE
exports.updateOrderIn = async (
  req,
  res
) => {
  try {
    const {
      invoiceNo,
      farmerName,
      businessType,
      productName,
      quantity,
      rate,
      purchaseDate,
      purchaseTime,
    } = req.body;

    const totalAmount =
      quantity * rate;

      const image =
  req.file
    ? req.file.filename
    : "";

    const order =
      await OrderIn.findByIdAndUpdate(
        req.params.id,
        {invoiceNo,
          farmerName,
          businessType,
          productName,
          quantity,
          rate,
          totalAmount,
          purchaseDate,
          purchaseTime,
          image
        },
        { new: true }
      );

    res.json({
      message:
        "Order updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE
exports.deleteOrderIn =
  async (req, res) => {
    try {
      await OrderIn.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Order deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };


  const getNextInvoiceNumber =
  async () => {
    const counter =
      await Counter.findOneAndUpdate(
        { name: "orderin_invoice" },
        { $inc: { sequence: 1 } },
        {
          new: true,
          upsert: true,
        }
      );

    return `INV-${String(
      counter.sequence
    ).padStart(6, "0")}`;
  };