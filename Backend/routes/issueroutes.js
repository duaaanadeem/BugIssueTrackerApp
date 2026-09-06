const express = require("express");

const {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  addComment,
  getComments,
  getIssueHistory,
} = require("../controllers/issuecontroller");

const authMiddleware = require("../middleware/authmiddleware");

const router = express.Router();

// Create issue
router.post("/", authMiddleware, createIssue);

// Get all issues
router.get("/", authMiddleware, getIssues);

// Add comment
router.post("/comments", authMiddleware, addComment);

// Get comments
router.get("/:issueId/comments", authMiddleware, getComments);

// Get issue history
router.get("/:issueId/history", authMiddleware, getIssueHistory);

// Get single issue
router.get("/:id", authMiddleware, getIssueById);

// Update issue
router.put("/:id", authMiddleware, updateIssue);

// Delete issue
router.delete("/:id", authMiddleware, deleteIssue);

module.exports = router;