const express = require("express");

const router = express.Router();

const {
  signup,
  login,
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
  deleteUser,
  getApprovedUsers,
} = require("../controllers/authController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public
router.post("/signup", signup);

router.post("/login", login);

// Admin
router.get("/pending-users", protect, adminOnly, getPendingUsers);

router.put("/approve/:id", protect, adminOnly, approveUser);

router.put("/reject/:id", protect, adminOnly, rejectUser);

router.get("/users", protect, adminOnly, getAllUsers);

router.get(
  "/approved",
  protect,
  adminOnly,
  getApprovedUsers
);

router.delete(
  "/users/:id",
  protect,
  adminOnly,
  deleteUser
);

module.exports = router;
