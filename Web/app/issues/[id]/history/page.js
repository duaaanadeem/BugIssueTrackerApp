"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "../../../../components/AppShell";
import ErrorMessage from "../../../../components/ErrorMessage";
import Loading from "../../../../components/Loading";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import { useAuth } from "../../../../context/AuthContext";
import { apiRequest } from "../../../../services/api";

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}

function HistoryContent() {
  const { id } = useParams();
  const { token, handleAuthError } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest(`/issues/${id}/history`, "GET", null, token);
      setHistory(data.history || []);
    } catch (err) {
      handleAuthError(err);
      setError(err.message || "Failed to load issue history.");
    } finally {
      setLoading(false);
    }
  }, [id, token, handleAuthError]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    const value = new Date(date);
    if (Number.isNaN(value.getTime())) {
      return "Unknown date";
    }

    return value.toLocaleString();
  };

  const getActionColor = (action) => {
    const value = (action || "").toLowerCase();

    if (value.includes("status")) {
      return { background: "#EEF2FF", color: "#4F46E5" };
    }

    if (value.includes("priority")) {
      return { background: "#FFF7ED", color: "#D97706" };
    }

    if (value.includes("assign")) {
      return { background: "#ECFDF5", color: "#059669" };
    }

    return { background: "#F1F5F9", color: "#475569" };
  };

  return (
    <AppShell title="History">
      <div className="header-row">
        <div>
          <h1 className="page-title">Issue History</h1>
          <p className="muted">Track changes made to this issue</p>
        </div>
        <div className="empty-icon" style={{ background: "#EEF2FF", color: "#4F46E5" }}>
          {history.length}
        </div>
      </div>

      {loading ? (
        <Loading message="Loading history..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadHistory} />
      ) : history.length === 0 ? (
        <div className="empty">
          <div className="empty-icon" style={{ background: "#EEF2FF", color: "#4F46E5" }}>
            ↺
          </div>
          <h2>No History Yet</h2>
          <p className="muted">Changes made to this issue will appear here.</p>
        </div>
      ) : (
        history.map((item, index) => {
          const colors = getActionColor(item.action);
          const actor =
            item.userId?.name ||
            item.createdBy?.name ||
            item.actor?.name ||
            "User";

          return (
            <div key={item._id || index} className="timeline">
              <div className="timeline-mark">
                <div className="dot" />
                {index !== history.length - 1 ? <div className="line" /> : null}
              </div>
              <div className="card card-border" style={{ flex: 1, marginBottom: 16 }}>
                <div className="row space-between wrap">
                  <span className="badge" style={colors}>
                    {item.action || "Updated"}
                  </span>
                  <span className="faint">{formatDate(item.createdAt)}</span>
                </div>
                <p className="muted">
                  Changed by <strong>{actor}</strong>
                </p>
                <div className="row wrap" style={{ background: "#F8FAFC", borderRadius: 12, padding: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div className="faint">OLD VALUE</div>
                    <div>{item.oldValue || "None"}</div>
                  </div>
                  <span className="muted">→</span>
                  <div style={{ flex: 1 }}>
                    <div className="faint">NEW VALUE</div>
                    <strong>{item.newValue || "None"}</strong>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </AppShell>
  );
}
