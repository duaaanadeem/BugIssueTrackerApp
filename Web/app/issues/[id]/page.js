"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import AppShell from "../../../components/AppShell";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import ChipGroup from "../../../components/ChipGroup";
import ErrorMessage from "../../../components/ErrorMessage";
import Loading from "../../../components/Loading";
import ProtectedRoute from "../../../components/ProtectedRoute";
import PriorityBadge from "../../../components/PriorityBadge";
import StatusBadge from "../../../components/StatusBadge";

import { useAuth } from "../../../context/AuthContext";
import { apiRequest } from "../../../services/api";

const statuses = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
];

const priorities = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

export default function IssueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();

  const issueId = params?.id;

  const [issue, setIssue] = useState(null);
  const [project, setProject] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  const [status, setStatus] = useState("Open");
  const [priority, setPriority] = useState("Medium");
  const [assignedTo, setAssignedTo] = useState("");

  /*
   * Load issue AND its actual project.
   *
   * The project is fetched separately so that the Assigned User
   * dropdown uses ONLY:
   *
   * 1. Project creator
   * 2. Project members
   */
  const loadIssue = useCallback(async () => {
    if (!issueId || !token) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Load issue
      const issueData = await apiRequest(
        `/issues/${issueId}`,
        "GET",
        null,
        token
      );

      const loadedIssue = issueData.issue;

      if (!loadedIssue) {
        throw new Error("Issue not found.");
      }

      setIssue(loadedIssue);

      setStatus(loadedIssue.status || "Open");
      setPriority(loadedIssue.priority || "Medium");

      setAssignedTo(
        loadedIssue.assignedTo?._id ||
          loadedIssue.assignedTo ||
          ""
      );

      /*
       * Get project ID.
       *
       * Depending on backend response, projectId can be:
       * - an object
       * - a string
       */
      const projectId =
        typeof loadedIssue.projectId === "object"
          ? loadedIssue.projectId?._id
          : loadedIssue.projectId;

      /*
       * Load the actual project separately.
       */
      if (projectId) {
        const projectData = await apiRequest(
          `/projects/${projectId}`,
          "GET",
          null,
          token
        );

        setProject(projectData.project);
      }
    } catch (err) {
      setError(
        err.message || "Unable to load issue."
      );
    } finally {
      setLoading(false);
    }
  }, [issueId, token]);

  useEffect(() => {
    loadIssue();
  }, [loadIssue]);

  /*
   * ONLY project creator + project members.
   *
   * No /auth/users request.
   * No global users list.
   */
  const projectUsers = useMemo(() => {
    if (!project) {
      return [];
    }

    const users = [];

    // Project creator
    if (project.createdBy?._id) {
      users.push(project.createdBy);
    }

    // Project members
    if (Array.isArray(project.members)) {
      users.push(...project.members);
    }

    /*
     * Remove duplicates.
     */
    return users.filter(
      (user, index, self) =>
        user?._id &&
        index ===
          self.findIndex(
            (item) => item?._id === user._id
          )
    );
  }, [project]);

  /*
   * Update issue
   */
  const updateIssue = async (changes = {}) => {
    if (!issueId) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = await apiRequest(
        `/issues/${issueId}`,
        "PUT",
        changes,
        token
      );

      setIssue(data.issue);

      setStatus(
        data.issue.status || "Open"
      );

      setPriority(
        data.issue.priority || "Medium"
      );

      setAssignedTo(
        data.issue.assignedTo?._id ||
          data.issue.assignedTo ||
          ""
      );
    } catch (err) {
      setError(
        err.message || "Unable to update issue."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Status change
   */
  const handleStatusChange = async (value) => {
    setStatus(value);

    await updateIssue({
      status: value,
    });
  };

  /*
   * Priority change
   */
  const handlePriorityChange = async (value) => {
    setPriority(value);

    await updateIssue({
      priority: value,
    });
  };

  /*
   * Assigned user change
   */
  const handleAssignedChange = async (event) => {
    const value = event.target.value;

    setAssignedTo(value);

    await updateIssue({
      assignedTo: value || null,
    });
  };

  /*
   * Delete issue
   */
  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this issue?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await apiRequest(
        `/issues/${issueId}`,
        "DELETE",
        null,
        token
      );

      router.push("/issues");
    } catch (err) {
      setError(
        err.message || "Unable to delete issue."
      );
    } finally {
      setDeleting(false);
    }
  };

  /*
   * Loading
   */
  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <Loading />
        </AppShell>
      </ProtectedRoute>
    );
  }

  /*
   * Issue not found
   */
  if (!issue) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="page">
            <ErrorMessage
              message={
                error || "Issue not found."
              }
            />

            <div style={{ marginTop: 20 }}>
              <Button
                onClick={() =>
                  router.push("/issues")
                }
              >
                Back to Issues
              </Button>
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="page">

          {/* Header */}
          <div className="page-header">
            <div>
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  router.push("/issues")
                }
              >
                ← Back to Issues
              </button>

              <h1 style={{ marginTop: 16 }}>
                {issue.title}
              </h1>

              <p className="muted">
                Issue details and management
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}
            >
              <StatusBadge
                status={issue.status}
              />

              <PriorityBadge
                priority={issue.priority}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: 20 }}>
              <ErrorMessage message={error} />
            </div>
          )}

          {/* Main information */}
          <div className="grid">

            {/* Issue information */}
            <Card>
              <h2>Issue Information</h2>

              <div style={{ marginTop: 20 }}>
                <strong>Description</strong>

                <p
                  style={{
                    whiteSpace: "pre-wrap",
                    marginTop: 8,
                  }}
                >
                  {issue.description}
                </p>
              </div>

              <div style={{ marginTop: 20 }}>
                <strong>Project</strong>

                <p className="muted">
                  {project?.name ||
                    issue.projectId?.name ||
                    "Unknown project"}
                </p>
              </div>

              <div style={{ marginTop: 20 }}>
                <strong>Created By</strong>

                <p className="muted">
                  {issue.createdBy?.name ||
                    "Unknown user"}
                </p>
              </div>

              <div style={{ marginTop: 20 }}>
                <strong>Created At</strong>

                <p className="muted">
                  {issue.createdAt
                    ? new Date(
                        issue.createdAt
                      ).toLocaleString()
                    : "Unknown"}
                </p>
              </div>
            </Card>

            {/* Manage issue */}
            <Card>
              <h2>Manage Issue</h2>

              {/* Status */}
              <div style={{ marginTop: 20 }}>
                <label className="label">
                  Status
                </label>

                <ChipGroup
                  options={statuses}
                  value={status}
                  onChange={
                    handleStatusChange
                  }
                />
              </div>

              {/* Priority */}
              <div style={{ marginTop: 24 }}>
                <label className="label">
                  Priority
                </label>

                <ChipGroup
                  options={priorities}
                  value={priority}
                  onChange={
                    handlePriorityChange
                  }
                />
              </div>

              {/* Assigned User */}
              <div style={{ marginTop: 24 }}>
                <label className="label">
                  Assigned User
                </label>

                <select
                  className="input"
                  value={assignedTo}
                  onChange={
                    handleAssignedChange
                  }
                  disabled={
                    saving ||
                    !project
                  }
                >
                  <option value="">
                    Unassigned
                  </option>

                  {projectUsers.map((user) => (
                    <option
                      key={user._id}
                      value={user._id}
                    >
                      {user.name}
                    </option>
                  ))}
                </select>

                <p
                  className="muted"
                  style={{
                    marginTop: 8,
                  }}
                >
                  Only the project creator and
                  project members can be assigned
                  to this issue.
                </p>

                {!project && (
                  <p
                    className="muted"
                    style={{
                      marginTop: 8,
                    }}
                  >
                    Loading project members...
                  </p>
                )}
              </div>

              {saving && (
                <p
                  className="muted"
                  style={{
                    marginTop: 16,
                  }}
                >
                  Saving changes...
                </p>
              )}
            </Card>
          </div>

          {/* Assignment */}
          <Card style={{ marginTop: 20 }}>
            <h2>Assignment</h2>

            {issue.assignedTo ? (
              <div style={{ marginTop: 16 }}>
                <strong>
                  {issue.assignedTo.name}
                </strong>

                {issue.assignedTo.email && (
                  <p className="muted">
                    {issue.assignedTo.email}
                  </p>
                )}
              </div>
            ) : (
              <p
                className="muted"
                style={{ marginTop: 16 }}
              >
                This issue is currently
                unassigned.
              </p>
            )}
          </Card>

          {/* Screenshots */}
          {issue.screenshots &&
            issue.screenshots.length > 0 && (
              <Card
                style={{
                  marginTop: 20,
                }}
              >
                <h2>Screenshots</h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 16,
                    marginTop: 16,
                  }}
                >
                  {issue.screenshots.map(
                    (screenshot, index) => (
                      <img
                        key={index}
                        src={screenshot}
                        alt={`Issue screenshot ${
                          index + 1
                        }`}
                        style={{
                          width: "100%",
                          maxHeight: 400,
                          objectFit: "contain",
                          borderRadius: 10,
                          border:
                            "1px solid #e5e7eb",
                          background:
                            "#f9fafb",
                        }}
                      />
                    )
                  )}
                </div>
              </Card>
            )}

          {/* Actions */}
          <Card style={{ marginTop: 20 }}>
            <h2>Issue Actions</h2>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 16,
              }}
            >
              <Button
                type="button"
                onClick={() =>
                  router.push(
                    `/issues/${issueId}/comments`
                  )
                }
              >
                Comments
              </Button>

              <Button
                type="button"
                onClick={() =>
                  router.push(
                    `/issues/${issueId}/history`
                  )
                }
              >
                History
              </Button>

              <button
                type="button"
                className="danger-button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Issue"}
              </button>
            </div>
          </Card>

        </div>
      </AppShell>
    </ProtectedRoute>
  );
}