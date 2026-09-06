const express = require("express");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectcontroller");

const authMiddleware = require("../middleware/authmiddleware");

const router = express.Router();

// Create project
router.post("/", authMiddleware, createProject);

// Get all projects
router.get("/", authMiddleware, getProjects);

// Get one project
router.get("/:id", authMiddleware, getProjectById);

// Update project
router.put("/:id", authMiddleware, updateProject);

// Delete project
router.delete("/:id", authMiddleware, deleteProject);

module.exports = router;