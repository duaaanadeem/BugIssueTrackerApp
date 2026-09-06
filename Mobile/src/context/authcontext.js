import React, { createContext, useState } from "react";

import { apiRequest } from "../services/api";
import { saveToken, removeToken } from "../utils/storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const data = await apiRequest("/auth/login", "POST", {
      email,
      password,
    });

    await saveToken(data.token);

    setToken(data.token);
    setUser(data.user);

    return data;
  };

  const signup = async (name, email, password) => {
    return await apiRequest("/auth/signup", "POST", {
      name,
      email,
      password,
    });
  };

  const logout = async () => {
    await removeToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};