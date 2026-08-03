const Product = require("../models/Product");

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      unit,
      purchasePrice,
      sellingPrice
    } = req.body;

    const existingProduct = await Product.findOne({
      name: name.trim()
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product already exists"
      });
    }

    const product = await Product.create({
      name,
      unit,
      purchasePrice,
      sellingPrice,
      image: req.file ? req.file.filename : null
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getProducts = async (req, res) => {
  try {

    const products = await Product.find({
      status: true
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getProductById = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {

    const updateData = {
      ...req.body
    };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};