"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

export default function IndexPage() {
  const { loading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    router.replace(token ? "/home" : "/login");
  }, [loading, token, router]);

  return <Loading message="Loading..." />;
}
