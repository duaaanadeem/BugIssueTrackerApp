"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppShell from "../../../components/AppShell";
import Button from "../../../components/Button";
import ErrorMessage from "../../../components/ErrorMessage";
import Input from "../../../components/Input";
import Loading from "../../../components/Loading";
import Modal from "../../../components/Modal";
import ProtectedRoute from "../../../components/ProtectedRoute";
import Toast from "../../../components/Toast";
import { useAuth } from "../../../context/AuthContext";
import { apiRequest } from "../../../services/api";

export default function ProjectDetailsPage() {
  return (
    <ProtectedRoute>
      <ProjectDetails />
    </ProtectedRoute>
  );
}

function ProjectDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { token, handleAuthError } = useAuth();
  const [project, setProject] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadProject = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest(`/projects/${id}`, "GET", null, token);
      setProject(data.project);
      setName(data.project?.name || "");
      setDescription(data.project?.description || "");
    } catch (err) {
      handleAuthError(err);
      setError(err.message || "Unable to load project");
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [id, token, handleAuthError]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    const next = {};

    if (!name.trim()) {
      next.name = "Project name is required";
    } else if (name.trim().length < 3) {
      next.name = "Project name must be at least 3 characters.";
    }

    if (!description.trim()) {
      next.description = "Description is required";
    }

    setErrors(next);
    if (Object.keys(next).length) {
      return;
    }

    try {
      setSaving(true);
      const data = await apiRequest(
        `/projects/${id}`,
        "PUT",
        {
          name: name.trim(),
          description: description.trim(),
        },
        token
      );
      setProject(data.project);
      setToastType("success");
      setToast("Project updated successfully.");
    } catch (err) {
      handleAuthError(err);
      setToastType("error");
      setToast(err.message || "Unable to update project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiRequest(`/projects/${id}`, "DELETE", null, token);
      setConfirmDelete(false);
      router.push("/projects");
    } catch (err) {
      handleAuthError(err);
      setConfirmDelete(false);
      setToastType("error");
      setToast(err.message || "Unable to delete project");
    }
  };

  return (
    <AppShell title="Project Details">
      {loading ? (
        <Loading message="Loading project..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadProject} />
      ) : !project ? (
        <ErrorMessage message="Project could not be found." />
      ) : (
        <>
          <div className="hero" style={{ marginBottom: 24 }}>
            <div
              className="icon-circle"
              style={{ background: "#fff", color: "#111827", marginBottom: 18 }}
            >
              {project.name?.charAt(0).toUpperCase() || "P"}
            </div>
            <h1 style={{ margin: 0, fontSize: 26 }}>{project.name}</h1>
            <p>{project.description}</p>
            <p className="faint">
              Created by {project.createdBy?.name || "Unknown user"}
            </p>
          </div>

          <h2>Project Actions</h2>
          <Link href={`/issues?projectId=${project._id}`} className="action-row">
            <div>
              <strong>View Issues</strong>
              <div className="muted">Search, filter and manage project issues.</div>
            </div>
            <span>→</span>
          </Link>
          <Link
            href={`/issues/create?projectId=${project._id}`}
            className="action-row"
            style={{ marginTop: 12 }}
          >
            <div>
              <strong>Report New Issue</strong>
              <div className="muted">
                Create a bug report with priority, screenshots and assignment.
              </div>
            </div>
            <span>+</span>
          </Link>

          <form className="card" style={{ marginTop: 24 }} onSubmit={handleUpdate}>
            <h2 style={{ marginTop: 0 }}>Update Project</h2>
            <Input
              label="Project Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={errors.name}
            />
            <Input
              as="textarea"
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              error={errors.description}
            />
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>

          <Button
            variant="danger"
            style={{ marginTop: 16 }}
            onClick={() => setConfirmDelete(true)}
          >
            Delete Project
          </Button>
        </>
      )}

      <Modal
        open={confirmDelete}
        title="Delete project"
        confirmLabel="Delete"
        danger
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      >
        This will permanently remove the project. This action cannot be undone.
      </Modal>
      <Toast message={toast} type={toastType} onDone={() => setToast("")} />
    </AppShell>
  );
}
