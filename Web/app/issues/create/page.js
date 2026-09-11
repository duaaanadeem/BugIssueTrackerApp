"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AppShell from "../../../components/AppShell";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import ChipGroup from "../../../components/ChipGroup";
import ErrorMessage from "../../../components/ErrorMessage";
import Input from "../../../components/Input";
import Loading from "../../../components/Loading";
import ProtectedRoute from "../../../components/ProtectedRoute";

import { useAuth } from "../../../context/AuthContext";
import { apiRequest } from "../../../services/api";

const priorities = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

const statuses = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
];

function CreateIssueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();

  const initialProjectId =
    searchParams.get("projectId") || "";

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(initialProjectId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Open");
  const [assignedTo, setAssignedTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadProjects = async () => {
    try {
      setLoading(true);

      const data = await apiRequest(
        "/projects",
        "GET",
        null,
        token
      );

      setProjects(data.projects || []);
    } catch (err) {
      setError(
        err.message || "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadProjects();
    }
  }, [token]);

  const selectedProject = projects.find(
    (project) => project._id === projectId
  );

  /*
   * Only project creator and project members
   * can be assigned to an issue.
   */
  const projectUsers = useMemo(() => {
    if (!selectedProject) {
      return [];
    }

    return [
      ...(selectedProject.createdBy
        ? [selectedProject.createdBy]
        : []),
      ...(selectedProject.members || []),
    ].filter(
      (user, index, self) =>
        user?._id &&
        index ===
          self.findIndex(
            (item) => item._id === user._id
          )
    );
  }, [selectedProject]);

  const handleProjectChange = (event) => {
    setProjectId(event.target.value);

    // Reset assigned user when project changes
    setAssignedTo("");
  };

  const createIssue = async (event) => {
    event.preventDefault();

    if (!projectId) {
      setError("Please select a project.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter an issue title.");
      return;
    }

    if (!description.trim()) {
      setError(
        "Please enter an issue description."
      );
      return;
    }

    try {
      setCreating(true);
      setError("");

      const data = await apiRequest(
        "/issues",
        "POST",
        {
          projectId,
          title: title.trim(),
          description: description.trim(),
          priority,
          status,
          assignedTo: assignedTo || null,
        },
        token
      );

      router.push(
        `/issues/${data.issue._id}`
      );
    } catch (err) {
      setError(
        err.message || "Unable to create issue."
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <Loading />
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="page">
          <div className="page-header">
            <div>
              <h1>Report New Issue</h1>
              <p>
                Create an issue inside a project.
              </p>
            </div>
          </div>

          <Card>
            <form onSubmit={createIssue}>
              <label className="label">
                Project
              </label>

              <select
                className="input"
                value={projectId}
                onChange={handleProjectChange}
              >
                <option value="">
                  Select Project
                </option>

                {projects.map((project) => (
                  <option
                    key={project._id}
                    value={project._id}
                  >
                    {project.name}
                  </option>
                ))}
              </select>

              <div style={{ marginTop: 18 }}>
                <Input
                  label="Issue Title"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Enter issue title"
                />
              </div>

              <div style={{ marginTop: 18 }}>
                <label className="label">
                  Description
                </label>

                <textarea
                  className="input"
                  rows={6}
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe the issue"
                />
              </div>

              <div style={{ marginTop: 20 }}>
                <label className="label">
                  Priority
                </label>

                <ChipGroup
                  options={priorities}
                  value={priority}
                  onChange={setPriority}
                />
              </div>

              <div style={{ marginTop: 20 }}>
                <label className="label">
                  Status
                </label>

                <ChipGroup
                  options={statuses}
                  value={status}
                  onChange={setStatus}
                />
              </div>

              <div style={{ marginTop: 20 }}>
                <label className="label">
                  Assigned User
                </label>

                <select
                  className="input"
                  value={assignedTo}
                  onChange={(event) =>
                    setAssignedTo(
                      event.target.value
                    )
                  }
                  disabled={!selectedProject}
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

                {selectedProject &&
                  projectUsers.length === 0 && (
                    <p className="muted">
                      No project members are available
                      for assignment.
                    </p>
                  )}
              </div>

              {error && (
                <div style={{ marginTop: 20 }}>
                  <ErrorMessage message={error} />
                </div>
              )}

              <div style={{ marginTop: 24 }}>
                <Button
                  type="submit"
                  disabled={creating}
                >
                  {creating
                    ? "Creating..."
                    : "Create Issue"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

export default function CreateIssuePage() {
  return (
    <Suspense
      fallback={
        <ProtectedRoute>
          <AppShell>
            <Loading />
          </AppShell>
        </ProtectedRoute>
      }
    >
      <CreateIssueContent />
    </Suspense>
  );
}
