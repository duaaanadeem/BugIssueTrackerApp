const express = require("express");

const {
  signup,
  login,
  getUsers,
  searchUserByName,
} = require("../controllers/authcontroller");

const authMiddleware = require("../middleware/authmiddleware");

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.get("/users", authMiddleware, getUsers);

router.get(
  "/users/search",
  authMiddleware,
  searchUserByName
);

module.exports = router;