const Wastage = require("../models/wastage");
const Product = require("../models/Product");

exports.createWastage = async (req, res) => {
    try {

        const {
            customerName,
            productName,
            quantity,
            reason,
            wastageDate,
            wastageTime
        } = req.body;

        const product = await Product.findOne({
  name: {
    $regex: `^${productName}$`,
    $options: "i"
  }
});

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const wastage = await Wastage.create({
            customerName,
            productName,
            quantity,
            reason,
            wastageDate,
            wastageTime,
           image: req.file
  ? `/uploads/wastage/${req.file.filename}`
  : "",
        });
        console.log("Body:", req.body);
console.log("File:", req.file);

        res.status(201).json({
            success: true,
            message: "Wastage recorded successfully",
            data: wastage
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getWastages = async (req, res) => {
    try {

        const wastages = await Wastage.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: wastages.length,
            data: wastages
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};