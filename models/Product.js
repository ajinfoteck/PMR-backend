const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    unit: {
        type: String,
        enum: ["kg", "bundle", "piece"],
        default: "kg"
    },

    purchasePrice: {
        type: Number,
        default: 0
    },

    sellingPrice: {
        type: Number,
        default: 0
    },
    
    stock: {
        type: Number,
        default: 0
    },

    image: {
        type: String
    },

    status: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Product", productSchema);