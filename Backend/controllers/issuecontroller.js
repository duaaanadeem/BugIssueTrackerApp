const Issue = require("../models/issue");
const Comment = require("../models/comment");
const IssueHistory = require("../models/issuehistory");
const User = require("../models/user");

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

    if (title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Issue title must be at least 3 characters",
      });
    }

    if (description.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Issue description must be at least 5 characters",
      });
    }

    const allowedPriorities = [
      "Low",
      "Medium",
      "High",
      "Critical",
    ];

    const allowedStatuses = [
      "Open",
      "In Progress",
      "Resolved",
      "Closed",
    ];

    if (
      priority &&
      !allowedPriorities.includes(priority)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority",
      });
    }

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);

      if (!assignedUser) {
        return res.status(400).json({
          success: false,
          message: "Assigned user not found",
        });
      }
    }

    const issue = await Issue.create({
      projectId,
      title: title.trim(),
      description: description.trim(),
      screenshots: Array.isArray(screenshots)
        ? screenshots
        : [],
      priority: priority || "Medium",
      status: status || "Open",
      assignedTo: assignedTo || null,
      createdBy: req.user.userId,
    });

    const populatedIssue = await Issue.findById(issue._id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("projectId", "name");

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      issue: populatedIssue,
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

    if (req.query.projectId) {
      filter.projectId = req.query.projectId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    if (req.query.search) {
      filter.title = {
        $regex: req.query.search,
        $options: "i",
      };
    }

    const issues = await Issue.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("projectId", "name")
      .sort({ createdAt: -1 });

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

    const oldStatus = issue.status;
    const oldPriority = issue.priority;
    const oldAssignedTo = issue.assignedTo;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }

      issue.title = title.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message: "Description cannot be empty",
        });
      }

      issue.description = description.trim();
    }

    if (screenshots !== undefined) {
      issue.screenshots = Array.isArray(screenshots)
        ? screenshots
        : [];
    }

    if (priority !== undefined) {
      issue.priority = priority;
    }

    if (status !== undefined) {
      issue.status = status;
    }

    if (assignedTo !== undefined) {
      if (assignedTo) {
        const assignedUser = await User.findById(
          assignedTo
        );

        if (!assignedUser) {
          return res.status(400).json({
            success: false,
            message: "Assigned user not found",
          });
        }
      }

      issue.assignedTo = assignedTo || null;
    }

    await issue.save();

    if (oldStatus !== issue.status) {
      await IssueHistory.create({
        issueId: issue._id,
        userId: req.user.userId,
        action: "Status changed",
        oldValue: oldStatus,
        newValue: issue.status,
      });
    }

    if (oldPriority !== issue.priority) {
      await IssueHistory.create({
        issueId: issue._id,
        userId: req.user.userId,
        action: "Priority changed",
        oldValue: oldPriority,
        newValue: issue.priority,
      });
    }

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
        oldValue: oldAssignedId || "Unassigned",
        newValue: newAssignedId || "Unassigned",
      });
    }

    const updatedIssue = await Issue.findById(issue._id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("projectId", "name");

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      issue: updatedIssue,
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

    await Comment.deleteMany({
      issueId: req.params.id,
    });

    await IssueHistory.deleteMany({
      issueId: req.params.id,
    });

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

    if (!issueId || !text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Issue ID and comment text are required",
      });
    }

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    const comment = await Comment.create({
      issueId,
      userId: req.user.userId,
      text: text.trim(),
    });

    const populatedComment =
      await Comment.findById(comment._id).populate(
        "userId",
        "name email"
      );

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populatedComment,
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