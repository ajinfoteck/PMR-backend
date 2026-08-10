const mongoose = require("mongoose");

const orderOutSchema = new mongoose.Schema(
  {
    vendorName: {
      type: String,
      required: true,
    },

    businessType: {
      type: String,
      enum: ["wholesale", "retail"],
      required: true,
    },

    items: [
  {
    productName: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },
    unit:{
      type: String,
    },

    rate: {
      type: Number,
      required: true,
    },

    total: {
      type: Number,
      required: true,
    },
  },
],
totalAmount: {
    type: Number,
    required: true,
  },
    paymentMethod: {
      type: String,
      enum: ["Cash", "GPay"],
      required: true
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    balanceAmount: {
      type: Number,
      default: 0,
    },
    paymentHistory: [
  {
    amount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "GPay"],
      required: true,
    },

    paymentDate: {
      type: String,
      required: true,
    },

    paymentTime: {
      type: String,
      required: true,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
],

    saleDate: {
      type: String,
      required: true,
    },

    saleTime: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  
  {
    timestamps: true,
  }
  
);

module.exports = mongoose.model(
  "OrderOut",
  orderOutSchema
);