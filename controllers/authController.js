const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// SIGNUP
exports.signup = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const userExists = await User.findOne({
      phone,
    });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const userCount = await User.countDocuments();

    const role = userCount === 0 ? "admin" : "staff";

    const status = userCount === 0 ? "approved" : "pending";

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phone,
      password: hashedPassword,
      role,
      status,
    });

    res.status(201).json({
      message:
        userCount === 0
          ? "Admin account created"
          : "Signup successful. Waiting for admin approval.",

      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({
      phone,
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (user.status === "pending") {
      return res.status(403).json({
        message: "Waiting for admin approval",
      });
    }

    if (user.status === "rejected") {
      return res.status(403).json({
        message: "Account rejected by admin",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    res.json({
      message: "Login successful",

      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,

      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET PENDING USERS
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({
      status: "pending",
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// APPROVE USER
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
      },
      {
        new: true,
      },
    );

    res.json({
      message: "User approved successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// REJECT USER
exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
      },
      {
        new: true,
      },
    );

    res.json({
      message: "User rejected successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getAllUsers = async (
  req,
  res
) => {
  try {

    const users =
      await User.find()
        .select("-password")
        .sort({
          createdAt: -1,
        });

    res.status(200).json(
      users
    );

  } catch (error) {

    res.status(500).json({
      message:
        error.message,
    });
  }
};



exports.getApprovedUsers = async (req, res) => {
  try {
    const users = await User.find({
      status: "approved"
    }).select("-password");

    res.status(200).json({
      success: true,
      data: users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting himself
    if (req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};