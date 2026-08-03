require("dotenv").config();

const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDB Connected");
});

// Test
app.get("/", (req, res) => {
  res.send("Backend Working");
});

// Server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
const customerSummaryRoutes = require("./routes/customersummaryroutes");

app.use("/api", customerSummaryRoutes);
// Routes
app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/order-in", require("./routes/orderinroutes"));

const path = require("path");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/order-out", require("./routes/orderoutroutes"));

app.use("/api/products", require("./routes/productroutes"));

app.use("/api/wastages", require("./routes/wastageroutes"));

app.use("/api/dashboard", require("./routes/dashboardroutes"));

app.use("/api/reports", require("./routes/reportroutes"));

