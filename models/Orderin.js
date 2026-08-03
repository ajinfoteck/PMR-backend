const mongoose = require("mongoose");

const orderInSchema = new mongoose.Schema(
  {
    farmerName: {
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

        rate: {
          type: Number,
          required: true,
        },

        total: {
          type: Number,
          default: 0,
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
      default: "Cash",
      required: true,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },
       balanceAmount: {
      type: Number,
      default: 0,
    },
    invoiceNo: {
  type: String,
  unique: true,
},

    purchaseDate: {
      type: String,
      required: true,
    },

    purchaseTime: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },
orderOutCreated: {
  type: Boolean,
  default: false,
},
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("OrderIn", orderInSchema);
