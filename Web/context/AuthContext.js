"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../services/api";

const TOKEN_KEY = "token";
const USER_KEY = "user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken = window.localStorage.getItem(TOKEN_KEY);
      const storedUser = window.localStorage.getItem(USER_KEY);

      if (storedToken) {
        setToken(storedToken);
        setUser(storedUser ? JSON.parse(storedUser) : null);
      }
    } catch {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiRequest("/auth/login", "POST", {
      email: email.trim().toLowerCase(),
      password,
    });

    window.localStorage.setItem(TOKEN_KEY, data.token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);

    return data;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    return apiRequest("/auth/signup", "POST", {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const handleAuthError = useCallback(
    (error) => {
      if (error?.status === 401) {
        logout();
      }
    },
    [logout]
  );

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      signup,
      logout,
      handleAuthError,
      isAuthenticated: Boolean(token),
    }),
    [token, user, loading, login, signup, logout, handleAuthError]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
