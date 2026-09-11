"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";

const PUBLIC_PATHS = ["/login", "/signup"];

export default function ProtectedRoute({ children, guestOnly = false }) {
  const { loading, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (guestOnly && token) {
      router.replace("/home");
      return;
    }

    if (!guestOnly && !token) {
      router.replace("/login");
    }
  }, [loading, token, guestOnly, router, pathname]);

  if (loading) {
    return <Loading message="Restoring session..." />;
  }

  if (guestOnly && token) {
    return <Loading message="Redirecting..." />;
  }

  if (!guestOnly && !token && !PUBLIC_PATHS.includes(pathname)) {
    return <Loading message="Redirecting to login..." />;
  }

  return children;
}
