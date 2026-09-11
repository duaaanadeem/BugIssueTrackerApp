"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import AppShell from "../../components/AppShell";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import IssueCard from "../../components/IssueCard";
import Loading from "../../components/Loading";
import ProtectedRoute from "../../components/ProtectedRoute";

import {
  PRIORITY_FILTERS,
  STATUS_FILTERS,
} from "../../constants/issues";

import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";

export default function IssuesPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<Loading message="Loading issues..." />}>
        <IssuesContent />
      </Suspense>
    </ProtectedRoute>
  );
}

function IssuesContent() {
  const searchParams = useSearchParams();

  const initialProjectId =
    searchParams.get("projectId") || "All";

  const { token, handleAuthError } = useAuth();

  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [projectId, setProjectId] = useState(initialProjectId);
  const [assignedTo, setAssignedTo] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setProjectId(initialProjectId);
  }, [initialProjectId]);

  /*
   * Load projects and users.
   *
   * Users are still loaded because when Project = All,
   * we need them to filter issues across all projects.
   */
  const loadLookups = useCallback(async () => {
    try {
      const [projectsData, usersData] = await Promise.all([
        apiRequest(
          "/projects",
          "GET",
          null,
          token
        ),

        apiRequest(
          "/auth/users",
          "GET",
          null,
          token
        ),
      ]);

      setProjects(projectsData.projects || []);
      setUsers(usersData.users || []);
    } catch (err) {
      handleAuthError(err);
    }
  }, [token, handleAuthError]);

  /*
   * Load issues
   */
  const loadIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (projectId && projectId !== "All") {
        params.set("projectId", projectId);
      }

      if (appliedSearch.trim()) {
        params.set(
          "search",
          appliedSearch.trim()
        );
      }

      if (status !== "All") {
        params.set("status", status);
      }

      if (priority !== "All") {
        params.set("priority", priority);
      }

      const query = params.toString();

      const data = await apiRequest(
        `/issues${query ? `?${query}` : ""}`,
        "GET",
        null,
        token
      );

      setIssues(data.issues || []);
    } catch (err) {
      handleAuthError(err);

      setError(
        err.message || "Unable to load issues"
      );
    } finally {
      setLoading(false);
    }
  }, [
    token,
    handleAuthError,
    projectId,
    appliedSearch,
    status,
    priority,
  ]);

  useEffect(() => {
    if (token) {
      loadLookups();
    }
  }, [token, loadLookups]);

  useEffect(() => {
    if (token) {
      loadIssues();
    }
  }, [token, loadIssues]);

  /*
   * Find selected project
   */
  const selectedProject = projects.find(
    (project) => project._id === projectId
  );

  /*
   * Get creator + members of selected project
   */
  const projectUsers = selectedProject
    ? [
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
      )
    : [];

  /*
   * When Project = All:
   * use all users because issues from multiple
   * projects can be displayed.
   *
   * When a specific project is selected:
   * only show creator + project members.
   */
  const assignedUsers =
    projectId === "All"
      ? users
      : projectUsers;

  /*
   * Reset assigned user if that user is no longer
   * available after changing project.
   */
  useEffect(() => {
    if (
      assignedTo !== "All" &&
      assignedTo !== "Unassigned" &&
      projectId !== "All"
    ) {
      const stillAvailable = projectUsers.some(
        (user) => user._id === assignedTo
      );

      if (!stillAvailable) {
        setAssignedTo("All");
      }
    }
  }, [
    projectId,
    assignedTo,
    projects,
  ]);

  /*
   * Filter issues by assigned user
   */
  const visibleIssues = useMemo(() => {
    if (assignedTo === "All") {
      return issues;
    }

    if (assignedTo === "Unassigned") {
      return issues.filter(
        (issue) => !issue.assignedTo
      );
    }

    return issues.filter(
      (issue) =>
        issue.assignedTo?._id === assignedTo
    );
  }, [issues, assignedTo]);

  return (
    <AppShell title="Issues">
      <div className="header-row">
        <div>
          <h1 className="page-title">
            Issues
          </h1>

          <p className="muted">
            Search, filter and manage
            reported issues.
          </p>
        </div>

        <Link
          href={`/issues/create${
            projectId !== "All"
              ? `?projectId=${projectId}`
              : ""
          }`}
          className="btn btn-primary btn-sm"
        >
          + Report
        </Link>
      </div>

      {/* Search */}
      <div className="search-row">
        <input
          className="input"
          placeholder="Search issues..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setAppliedSearch(search);
            }
          }}
        />

        <Button
          type="button"
          onClick={() =>
            setAppliedSearch(search)
          }
        >
          Search
        </Button>
      </div>

      {/* Filters */}
      <div className="filters">

        {/* Project */}
        <div className="filter-group">
          <div className="label">
            Project
          </div>

          <select
            className="input"
            value={projectId}
            onChange={(event) => {
              setProjectId(event.target.value);
              setAssignedTo("All");
            }}
          >
            <option value="All">
              All
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
        </div>

        {/* Status */}
        <div className="filter-group">
          <div className="label">
            Status
          </div>

          <select
            className="input"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
          >
            {STATUS_FILTERS.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div className="filter-group">
          <div className="label">
            Priority
          </div>

          <select
            className="input"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value)
            }
          >
            {PRIORITY_FILTERS.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned User */}
        <div className="filter-group">
          <div className="label">
            Assigned user
          </div>

          <select
            className="input"
            value={assignedTo}
            onChange={(event) =>
              setAssignedTo(event.target.value)
            }
          >
            <option value="All">
              All
            </option>

            <option value="Unassigned">
              Unassigned
            </option>

            {assignedUsers.map((user) => (
              <option
                key={user._id}
                value={user._id}
              >
                {user.name}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Issues */}
      {loading ? (
        <Loading message="Loading issues..." />
      ) : error ? (
        <ErrorMessage
          message={error}
          onRetry={loadIssues}
        />
      ) : visibleIssues.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            ✓
          </div>

          <h2>
            No issues found
          </h2>

          <p className="muted">
            Try changing your search
            or filters, or report a
            new issue.
          </p>
        </div>
      ) : (
        <div className="issue-grid">
          {visibleIssues.map((issue) => (
            <IssueCard
              key={issue._id}
              issue={issue}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}