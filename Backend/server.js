const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const errorMiddleware = require("./middleware/errormiddleware");

dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
const authRoutes = require("./routes/authroutes");

app.use("/api/auth", authRoutes);

// Project routes
const projectRoutes = require("./routes/projectroutes");

app.use("/api/projects", projectRoutes);

// Issue routes
const issueRoutes = require("./routes/issueroutes");

app.use("/api/issues", issueRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bug & Issue Tracking API is running",
  });
});

// Health-check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
  });
});

// Error middleware
app.use(errorMiddleware);

// Get port from environment variables
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});