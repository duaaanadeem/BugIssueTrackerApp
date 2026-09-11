"use client";

import AppShell from "../../components/AppShell";
import Button from "../../components/Button";
import Card from "../../components/Card";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, logout } = useAuth();

  return (
    <AppShell title="Profile">
      <Card dark>
        <div className="row" style={{ flexDirection: "column", alignItems: "center" }}>
          <div
            className="avatar"
            style={{
              width: 78,
              height: 78,
              borderRadius: 25,
              background: "#fff",
              color: "#111827",
              fontSize: 30,
            }}
          >
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <h2 style={{ marginBottom: 4 }}>{user?.name || "N/A"}</h2>
          <div className="muted" style={{ color: "#cbd5e1", textTransform: "capitalize" }}>
            {user?.role || "user"}
          </div>
        </div>
      </Card>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="info-row">
          <span className="muted">Name</span>
          <strong>{user?.name || "N/A"}</strong>
        </div>
        <div className="info-row">
          <span className="muted">Email</span>
          <strong>{user?.email || "N/A"}</strong>
        </div>
        <div className="info-row">
          <span className="muted">Role</span>
          <strong>{user?.role || "N/A"}</strong>
        </div>
      </div>

      <Button
        variant="danger"
        block
        style={{ marginTop: 20 }}
        onClick={() => {
          if (window.confirm("Are you sure you want to logout?")) {
            logout();
          }
        }}
      >
        Logout
      </Button>
    </AppShell>
  );
}
