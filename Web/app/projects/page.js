"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import Loading from "../../components/Loading";
import ProjectCard from "../../components/ProjectCard";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <ProjectsContent />
    </ProtectedRoute>
  );
}

function ProjectsContent() {
  const { token, handleAuthError } = useAuth();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/projects", "GET", null, token);
      setProjects(data.projects || []);
    } catch (err) {
      handleAuthError(err);
      setError(err.message || "Unable to load projects");
    } finally {
      setLoading(false);
    }
  }, [token, handleAuthError]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return projects;
    }

    return projects.filter((project) =>
      `${project.name} ${project.description || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [projects, search]);

  return (
    <AppShell title="Projects">
      <div className="header-row">
        <div>
          <h1 className="page-title">Your Projects</h1>
          <p className="muted">
            {filtered.length} project{filtered.length === 1 ? "" : "s"} available
          </p>
        </div>
        <Link href="/projects/create" className="btn btn-primary btn-sm">
          + New
        </Link>
      </div>

      <div className="search-row">
        <input
          className="input"
          placeholder="Search projects by title..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Button type="button" onClick={loadProjects}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <Loading message="Loading projects..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadProjects} />
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">P</div>
          <h2>No projects found</h2>
          <p className="muted">
            Create your first project to start tracking issues.
          </p>
          <Link href="/projects/create" className="btn btn-primary">
            Create Project
          </Link>
        </div>
      ) : (
        <div className="project-grid">
          {filtered.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
