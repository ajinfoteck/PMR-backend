const mongoose = require("mongoose");

const wastageSchema = new mongoose.Schema(
{
     customerName: {
      type: String,
      default: "",
    },
    productName: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    reason: {
        type: String,
        enum: [
            "Spoiled",
            "Damaged",
            "Expired",
            "Other"
        ],
        default: "Other"
    },

    image: {
        type: String,
        default: ""
    },


},
{
    timestamps: true
});

module.exports = mongoose.model(
    "Wastage",
    wastageSchema
);