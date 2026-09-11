"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../../components/Button";
import Input from "../../components/Input";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  return (
    <ProtectedRoute guestOnly>
      <LoginForm />
    </ProtectedRoute>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};

    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!email.includes("@")) {
      next.email = "Please enter a valid email address.";
    }

    if (!password) {
      next.password = "Password is required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      router.replace("/home");
    } catch (error) {
      setFormError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="logo-lg">BI</div>
        <h1 className="center-title">Bug & Issue Tracker</h1>
        <p className="subtitle center">
          Manage projects, report issues, and track progress.
        </p>

        <form className="card" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
            autoComplete="current-password"
          />

          {formError ? <p className="error-text">{formError}</p> : null}

          <Button type="submit" block disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="divider">OR</div>

          <Link href="/signup" className="btn btn-secondary btn-block">
            Create Account
          </Link>
        </form>

        <p className="faint center" style={{ marginTop: 24 }}>
          Secure project and issue management
        </p>
      </div>
    </div>
  );
}
