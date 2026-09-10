const Project = require("../models/project");
const User = require("../models/user");

// ==================================================
// CREATE PROJECT
// ==================================================

const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    // Validate name
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    // Validate description
    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project description is required",
      });
    }

    // Validate members
    let projectMembers = [];

    if (members !== undefined) {
      if (!Array.isArray(members)) {
        return res.status(400).json({
          success: false,
          message: "Members must be an array",
        });
      }

      projectMembers = members;
    }

    // Check that all members exist
    if (projectMembers.length > 0) {
      const users = await User.find({
        _id: { $in: projectMembers },
      }).select("_id");

      if (users.length !== projectMembers.length) {
        return res.status(400).json({
          success: false,
          message: "One or more members were not found",
        });
      }
    }

    // Create project
    const project = await Project.create({
      name: name.trim(),
      description: description.trim(),
      members: projectMembers,
      createdBy: req.user.userId,
    });

    // Populate project
    const populatedProject = await Project.findById(
      project._id
    )
      .populate("createdBy", "name email")
      .populate("members", "name email");

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: populatedProject,
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
// GET PROJECTS
// ==================================================
// Shows projects where:
// 1. Logged-in user is the creator
// OR
// 2. Logged-in user is a member
// ==================================================

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { createdBy: req.user.userId },
        { members: req.user.userId },
      ],
    })
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
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
// GET SINGLE PROJECT
// ==================================================

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user.userId },
        { members: req.user.userId },
      ],
    })
      .populate("createdBy", "name email")
      .populate("members", "name email");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      project,
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
// UPDATE PROJECT
// ==================================================
// Only the project creator can update it.
// ==================================================

const updateProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    // Find project owned by logged-in user
    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found or you do not have permission to update it",
      });
    }

    // Update name
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Project name cannot be empty",
        });
      }

      project.name = name.trim();
    }

    // Update description
    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Project description cannot be empty",
        });
      }

      project.description = description.trim();
    }

    // Update members
    if (members !== undefined) {
      if (!Array.isArray(members)) {
        return res.status(400).json({
          success: false,
          message: "Members must be an array",
        });
      }

      // Check that all members exist
      if (members.length > 0) {
        const users = await User.find({
          _id: { $in: members },
        }).select("_id");

        if (users.length !== members.length) {
          return res.status(400).json({
            success: false,
            message:
              "One or more members were not found",
          });
        }
      }

      project.members = members;
    }

    await project.save();

    // Populate updated project
    const updatedProject = await Project.findById(
      project._id
    )
      .populate("createdBy", "name email")
      .populate("members", "name email");

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
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
// DELETE PROJECT
// ==================================================
// Only the project creator can delete it.
// ==================================================

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found or you do not have permission to delete it",
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
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
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};