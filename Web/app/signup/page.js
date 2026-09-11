"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Button from "../../components/Button";
import Input from "../../components/Input";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  return (
    <ProtectedRoute guestOnly>
      <SignupForm />
    </ProtectedRoute>
  );
}

function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      next.name = "Name is required";
    } else if (trimmedName.length < 2) {
      next.name = "Name must be at least 2 characters.";
    }

    if (!trimmedEmail) {
      next.email = "Email is required";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      next.email = "Please enter a valid email address.";
    }

    if (!password) {
      next.password = "Password is required";
    } else if (password.length < 6) {
      next.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setSuccess("");

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      await signup(name, email, password);

      setSuccess("Your account has been created successfully.");

      setTimeout(() => {
        router.push("/login");
      }, 900);
    } catch (error) {
      setFormError(error.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrap">

        <Link href="/login" className="back-link">
          ← Back to Login
        </Link>

        <div className="logo-lg">BI</div>

        <h1 className="center-title">Create Account</h1>

        <p className="subtitle center">
          Join your project team and start tracking issues.
        </p>

        <form className="card" onSubmit={handleSubmit}>

          <Input
            label="Full Name"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={errors.name}
            autoComplete="name"
          />

          <Input
            label="Email Address"
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
            placeholder="At least 6 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
            autoComplete="new-password"
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          {formError ? (
            <p className="error-text">{formError}</p>
          ) : null}

          {success ? (
            <p className="muted">{success}</p>
          ) : null}

          <Button
            type="submit"
            block
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="divider">OR</div>

          <Link
            href="/login"
            className="btn btn-secondary btn-block"
          >
            Sign In
          </Link>

        </form>

        <p className="faint center" style={{ marginTop: 24 }}>
          Secure project and issue management
        </p>

      </div>
    </div>
  );
}
