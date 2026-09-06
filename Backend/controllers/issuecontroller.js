const Issue = require("../models/issue");
const Comment = require("../models/comment");
const IssueHistory = require("../models/issuehistory");

// Create Issue
const createIssue = async (req, res) => {
  try {
    const {
      projectId,
      title,
      description,
      screenshots,
      priority,
      status,
      assignedTo,
    } = req.body;

    if (!projectId || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "Project ID, title and description are required",
      });
    }

    const issue = await Issue.create({
      projectId,
      title,
      description,
      screenshots: screenshots || [],
      priority: priority || "Medium",
      status: status || "Open",
      assignedTo: assignedTo || null,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      issue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get All Issues
const getIssues = async (req, res) => {
  try {
    const filter = {};

    // Filter by project
    if (req.query.projectId) {
      filter.projectId = req.query.projectId;
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by priority
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    // Search by title
    if (req.query.search) {
      filter.title = {
        $regex: req.query.search,
        $options: "i",
      };
    }

    const issues = await Issue.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("projectId", "name");

    res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Single Issue
const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("projectId", "name");

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      issue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update Issue
const updateIssue = async (req, res) => {
  try {
    const {
      title,
      description,
      screenshots,
      priority,
      status,
      assignedTo,
    } = req.body;

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    // Store old values for history
    const oldStatus = issue.status;
    const oldPriority = issue.priority;
    const oldAssignedTo = issue.assignedTo;

    if (title !== undefined) {
      issue.title = title;
    }

    if (description !== undefined) {
      issue.description = description;
    }

    if (screenshots !== undefined) {
      issue.screenshots = screenshots;
    }

    if (priority !== undefined) {
      issue.priority = priority;
    }

    if (status !== undefined) {
      issue.status = status;
    }

    if (assignedTo !== undefined) {
      issue.assignedTo = assignedTo;
    }

    await issue.save();

    // Save status history
    if (oldStatus !== issue.status) {
      await IssueHistory.create({
        issueId: issue._id,
        userId: req.user.userId,
        action: "Status changed",
        oldValue: oldStatus,
        newValue: issue.status,
      });
    }

    // Save priority history
    if (oldPriority !== issue.priority) {
      await IssueHistory.create({
        issueId: issue._id,
        userId: req.user.userId,
        action: "Priority changed",
        oldValue: oldPriority,
        newValue: issue.priority,
      });
    }

    // Save assignment history
    const oldAssignedId = oldAssignedTo
      ? String(oldAssignedTo)
      : "";

    const newAssignedId = issue.assignedTo
      ? String(issue.assignedTo)
      : "";

    if (oldAssignedId !== newAssignedId) {
      await IssueHistory.create({
        issueId: issue._id,
        userId: req.user.userId,
        action: "User assigned",
        oldValue: oldAssignedId,
        newValue: newAssignedId,
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      issue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete Issue
const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    await Issue.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Add Comment
const addComment = async (req, res) => {
  try {
    const { issueId, text } = req.body;

    if (!issueId || !text) {
      return res.status(400).json({
        success: false,
        message: "Issue ID and comment text are required",
      });
    }

    const comment = await Comment.create({
      issueId,
      userId: req.user.userId,
      text,
    });

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Comments
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      issueId: req.params.issueId,
    })
      .populate("userId", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Issue History
const getIssueHistory = async (req, res) => {
  try {
    const history = await IssueHistory.find({
      issueId: req.params.issueId,
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  addComment,
  getComments,
  getIssueHistory,
};