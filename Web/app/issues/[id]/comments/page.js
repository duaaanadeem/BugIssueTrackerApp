"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "../../../../components/AppShell";
import Button from "../../../../components/Button";
import ErrorMessage from "../../../../components/ErrorMessage";
import Loading from "../../../../components/Loading";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import { useAuth } from "../../../../context/AuthContext";
import { apiRequest } from "../../../../services/api";

export default function CommentsPage() {
  return (
    <ProtectedRoute>
      <CommentsContent />
    </ProtectedRoute>
  );
}

function CommentsContent() {
  const { id } = useParams();
  const { token, user, handleAuthError } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest(`/issues/${id}/comments`, "GET", null, token);
      setComments(data.comments || []);
    } catch (err) {
      handleAuthError(err);
      setError(err.message || "Unable to load comments");
    } finally {
      setLoading(false);
    }
  }, [id, token, handleAuthError]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const addComment = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!text.trim()) {
      setFormError("Please write a comment first.");
      return;
    }

    try {
      setSending(true);
      const data = await apiRequest(
        "/issues/comments",
        "POST",
        {
          issueId: id,
          text: text.trim(),
        },
        token
      );
      setComments((previous) => [...previous, data.comment]);
      setText("");
    } catch (err) {
      handleAuthError(err);
      setFormError(err.message || "Unable to add comment");
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell title="Comments">
      {loading ? (
        <Loading message="Loading comments..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadComments} />
      ) : comments.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">C</div>
          <h2>No comments yet</h2>
          <p className="muted">Start the conversation about this issue.</p>
        </div>
      ) : (
        comments.map((comment) => {
          const isMine = comment.userId?._id === user?.id;

          return (
            <div key={comment._id} className={`comment ${isMine ? "mine" : ""}`}>
              <div className="row space-between">
                <strong>{comment.userId?.name || "User"}</strong>
                <span className="faint">
                  {comment.createdAt
                    ? new Date(comment.createdAt).toLocaleDateString()
                    : ""}
                </span>
              </div>
              <p className="muted">{comment.text}</p>
            </div>
          );
        })
      )}

      <form className="composer" onSubmit={addComment} style={{ marginTop: 16 }}>
        <textarea
          className="textarea"
          style={{ minHeight: 70, margin: 0 }}
          placeholder="Write a comment..."
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <Button type="submit" disabled={sending}>
          {sending ? "..." : "Send"}
        </Button>
      </form>
      {formError ? <p className="error-text">{formError}</p> : null}
    </AppShell>
  );
}
