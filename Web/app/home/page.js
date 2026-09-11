"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import ErrorMessage from "../../components/ErrorMessage";
import Loading from "../../components/Loading";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}

function HomeContent() {
  const { user, token, handleAuthError } = useAuth();
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [projectsData, issuesData] = await Promise.all([
        apiRequest("/projects", "GET", null, token),
        apiRequest("/issues", "GET", null, token),
      ]);

      setProjects(projectsData.projects || []);
      setIssues(issuesData.issues || []);
    } catch (err) {
      handleAuthError(err);
      setError(err.message || "Unable to load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, [token, handleAuthError]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const openIssues = issues.filter((issue) => issue.status === "Open").length;
  const inProgress = issues.filter((issue) => issue.status === "In Progress").length;
  const resolvedClosed = issues.filter(
    (issue) => issue.status === "Resolved" || issue.status === "Closed"
  ).length;

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);

  const recentIssues = issues.slice(0, 4);

  return (
    <AppShell title="Home">
      <div className="header-row">
        <div>
          <div className="muted">Welcome back,</div>
          <h1 className="page-title">{user?.name || "there"}</h1>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading dashboard..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadSummary} />
      ) : (
        <>
          <div className="stats-grid">
            <Stat label="Projects" value={projects.length} />
            <Stat label="Total Issues" value={issues.length} />
            <Stat label="Open Issues" value={openIssues} />
            <Stat label="In Progress" value={inProgress} />
            <Stat label="Resolved / Closed" value={resolvedClosed} />
          </div>

          <h2 style={{ marginTop: 28 }}>Quick Actions</h2>
          <div className="grid">
            <Link href="/projects" className="action-row">
              <div>
                <strong>My Projects</strong>
                <div className="muted">View, create and manage your projects.</div>
              </div>
              <span className="muted">→</span>
            </Link>
            <Link href="/projects/create" className="action-row">
              <div>
                <strong>New Project</strong>
                <div className="muted">Start tracking issues on a new project.</div>
              </div>
              <span className="muted">+</span>
            </Link>
            <Link href="/issues" className="action-row">
              <div>
                <strong>All Issues</strong>
                <div className="muted">Search, filter and update reported issues.</div>
              </div>
              <span className="muted">→</span>
            </Link>
            <Link href="/profile" className="action-row">
              <div>
                <strong>My Profile</strong>
                <div className="muted">View your account details.</div>
              </div>
              <span className="muted">→</span>
            </Link>
          </div>

          <div className="two-col" style={{ marginTop: 28 }}>
            <section className="card">
              <div className="row space-between">
                <h2 style={{ margin: 0, fontSize: 18 }}>Recent Projects</h2>
                <Link href="/projects" className="muted">
                  View all
                </Link>
              </div>
              {recentProjects.length === 0 ? (
                <p className="muted">No projects found</p>
              ) : (
                recentProjects.map((project) => (
                  <div key={project._id} className="recent-item">
                    <Link href={`/projects/${project._id}`}>
                      <strong>{project.name}</strong>
                      <div className="faint">{project.description}</div>
                    </Link>
                  </div>
                ))
              )}
            </section>

            <section className="card">
              <div className="row space-between">
                <h2 style={{ margin: 0, fontSize: 18 }}>Recent Issues</h2>
                <Link href="/issues" className="muted">
                  View all
                </Link>
              </div>
              {recentIssues.length === 0 ? (
                <p className="muted">No issues found</p>
              ) : (
                recentIssues.map((issue) => (
                  <div key={issue._id} className="recent-item">
                    <Link href={`/issues/${issue._id}`}>
                      <strong>{issue.title}</strong>
                      <div className="faint">
                        {issue.projectId?.name || "Project"} · {issue.status}
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </section>
          </div>
        </>
      )}
    </AppShell>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
