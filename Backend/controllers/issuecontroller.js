const Issue = require("../models/issue");
const Project = require("../models/project");
const Comment = require("../models/comment");
const IssueHistory = require("../models/issuehistory");
const User = require("../models/user");

// --------------------------------------------------
// Helper: Get project if user has access
// --------------------------------------------------

const getAccessibleProject = async (projectId, userId) => {
  return await Project.findOne({
    _id: projectId,
    $or: [
      { createdBy: userId },
      { members: userId },
    ],
  });
};

// --------------------------------------------------
// Helper: Check whether user belongs to project
// --------------------------------------------------

const isProjectMember = (project, userId) => {
  const isOwner =
    String(project.createdBy) === String(userId);

  const isMember = project.members.some(
    (memberId) => String(memberId) === String(userId)
  );

  return isOwner || isMember;
};

// --------------------------------------------------
// Helper: Check assigned user belongs to project
// --------------------------------------------------

const isUserInProject = (project, userId) => {
  return project.members.some(
    (memberId) => String(memberId?._id || memberId) === String(userId)
  );
};

const populateIssueRelations = (query) =>
  query
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .populate({
      path: "projectId",
      select: "name members createdBy",
      populate: [
        { path: "members", select: "name email" },
        { path: "createdBy", select: "name email" },
      ],
    });

// ==================================================
// CREATE ISSUE
// ==================================================

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

    // Basic validation
    if (!projectId || !title || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Project ID, title and description are required",
      });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message:
          "Issue title must be at least 3 characters",
      });
    }

    if (description.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message:
          "Issue description must be at least 5 characters",
      });
    }

    // Allowed values
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

    // Check project access
    const project = await getAccessibleProject(
      projectId,
      req.user.userId
    );

    if (!project) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this project",
      });
    }

    // Check assigned user
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

      // Assigned user must belong to project
      if (!isUserInProject(project, assignedTo)) {
        return res.status(400).json({
          success: false,
          message:
            "Assigned user must be a member of this project",
        });
      }
    }

    // Create issue
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

    // Populate response
    const populatedIssue = await populateIssueRelations(
      Issue.findById(issue._id)
    );

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

// ==================================================
// GET ALL ISSUES
// ==================================================

const getIssues = async (req, res) => {
  try {
    // Find projects accessible to logged-in user
    const accessibleProjects = await Project.find({
      $or: [
        { createdBy: req.user.userId },
        { members: req.user.userId },
      ],
    }).select("_id");

    const projectIds = accessibleProjects.map(
      (project) => project._id
    );

    // Only issues belonging to accessible projects
    const filter = {
      projectId: {
        $in: projectIds,
      },
    };

    // Filter by project
    if (req.query.projectId) {
      const project = await getAccessibleProject(
        req.query.projectId,
        req.user.userId
      );

      if (!project) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have access to this project",
        });
      }

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

    const issues = await populateIssueRelations(
      Issue.find(filter)
    ).sort({ createdAt: -1 });

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

// ==================================================
// GET SINGLE ISSUE
// ==================================================

const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    // Check project access
    const project = await getAccessibleProject(
      issue.projectId,
      req.user.userId
    );

    if (!project) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this issue",
      });
    }

    const populatedIssue = await populateIssueRelations(
      Issue.findById(issue._id)
    );

    res.status(200).json({
      success: true,
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

// ==================================================
// UPDATE ISSUE
// ==================================================

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

    // Check project access
    const project = await getAccessibleProject(
      issue.projectId,
      req.user.userId
    );

    if (!project) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this issue",
      });
    }

    const oldStatus = issue.status;
    const oldPriority = issue.priority;
    const oldAssignedTo = issue.assignedTo;

    // Validate title
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }

      if (title.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message:
            "Issue title must be at least 3 characters",
        });
      }

      issue.title = title.trim();
    }

    // Validate description
    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message: "Description cannot be empty",
        });
      }

      if (description.trim().length < 5) {
        return res.status(400).json({
          success: false,
          message:
            "Issue description must be at least 5 characters",
        });
      }

      issue.description = description.trim();
    }

    // Screenshots
    if (screenshots !== undefined) {
      issue.screenshots = Array.isArray(screenshots)
        ? screenshots
        : [];
    }

    // Priority
    if (priority !== undefined) {
      const allowedPriorities = [
        "Low",
        "Medium",
        "High",
        "Critical",
      ];

      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid priority",
        });
      }

      issue.priority = priority;
    }

    // Status
    if (status !== undefined) {
      const allowedStatuses = [
        "Open",
        "In Progress",
        "Resolved",
        "Closed",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      issue.status = status;
    }

    // Assigned user
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

        // Must belong to project
        if (!isUserInProject(project, assignedTo)) {
          return res.status(400).json({
            success: false,
            message:
              "Assigned user must be a member of this project",
          });
        }
      }

      issue.assignedTo = assignedTo || null;
    }

    await issue.save();

    // --------------------------------------------------
    // Create history for status change
    // --------------------------------------------------

    if (oldStatus !== issue.status) {
      await IssueHistory.create({
        issueId: issue._id,
        userId: req.user.userId,
        action: "Status changed",
        oldValue: oldStatus,
        newValue: issue.status,
      });
    }

    // --------------------------------------------------
    // Create history for priority change
    // --------------------------------------------------

    if (oldPriority !== issue.priority) {
      await IssueHistory.create({
        issueId: issue._id,
        userId: req.user.userId,
        action: "Priority changed",
        oldValue: oldPriority,
        newValue: issue.priority,
      });
    }

    // --------------------------------------------------
    // Create history for assignment change
    // --------------------------------------------------

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
        oldValue:
          oldAssignedId || "Unassigned",
        newValue:
          newAssignedId || "Unassigned",
      });
    }

    // Get updated issue
    const updatedIssue = await populateIssueRelations(
      Issue.findById(issue._id)
    );

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

// ==================================================
// DELETE ISSUE
// ==================================================

const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    // Check project access
    const project = await getAccessibleProject(
      issue.projectId,
      req.user.userId
    );

    if (!project) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to delete this issue",
      });
    }

    await Issue.findByIdAndDelete(req.params.id);

    // Delete comments
    await Comment.deleteMany({
      issueId: req.params.id,
    });

    // Delete history
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

// ==================================================
// ADD COMMENT
// ==================================================

const addComment = async (req, res) => {
  try {
    const { issueId, text } = req.body;

    if (!issueId || !text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Issue ID and comment text are required",
      });
    }

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    // Check project access
    const project = await getAccessibleProject(
      issue.projectId,
      req.user.userId
    );

    if (!project) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this issue",
      });
    }

    const comment = await Comment.create({
      issueId,
      userId: req.user.userId,
      text: text.trim(),
    });

    const populatedComment =
      await Comment.findById(
        comment._id
      ).populate("userId", "name email");

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

// ==================================================
// GET COMMENTS
// ==================================================

const getComments = async (req, res) => {
  try {
    const issue = await Issue.findById(
      req.params.issueId
    );

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    // Check project access
    const project = await getAccessibleProject(
      issue.projectId,
      req.user.userId
    );

    if (!project) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this issue",
      });
    }

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

// ==================================================
// GET ISSUE HISTORY
// ==================================================

const getIssueHistory = async (req, res) => {
  try {
    const issue = await Issue.findById(
      req.params.issueId
    );

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    // Check project access
    const project = await getAccessibleProject(
      issue.projectId,
      req.user.userId
    );

    if (!project) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this issue",
      });
    }

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

// ==================================================
// EXPORTS
// ==================================================

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