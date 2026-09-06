const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const errorMiddleware = require("./middleware/errormiddleware");

dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

const authRoutes = require("./routes/authroutes");
const projectRoutes = require("./routes/projectroutes");
const issueRoutes = require("./routes/issueroutes");

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/issues", issueRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bug & Issue Tracking API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
  });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});