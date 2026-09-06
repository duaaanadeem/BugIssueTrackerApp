import React, {
createContext,
useEffect,
useState,
} from "react";

import { apiRequest } from "../services/api";

import {
saveToken,
getToken,
saveUser,
getUser,
clearStorage,
} from "../utils/storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
const [token, setToken] = useState(null);
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
const restoreSession = async () => {
try {
const storedToken = await getToken();
const storedUser = await getUser();

    if (storedToken) {
      setToken(storedToken);
      setUser(storedUser);
    }
  } catch (error) {
    console.log("Session restore error:", error);

    await clearStorage();
    setToken(null);
    setUser(null);
  } finally {
    setLoading(false);
  }
};

restoreSession();

}, []);

const login = async (email, password) => {
const data = await apiRequest(
"/auth/login",
"POST",
{
email: email.trim().toLowerCase(),
password,
}
);

await saveToken(data.token);
await saveUser(data.user);

setToken(data.token);
setUser(data.user);

return data;

};

const signup = async (name, email, password) => {
const data = await apiRequest(
"/auth/signup",
"POST",
{
name: name.trim(),
email: email.trim().toLowerCase(),
password,
}
);

return data;

};

const logout = async () => {
try {
await clearStorage();
} catch (error) {
console.log("Logout storage error:", error);
}

setToken(null);
setUser(null);

};

return (
<AuthContext.Provider
value={{
token,
user,
loading,
login,
signup,
logout,
}}
>
{children}
</AuthContext.Provider>
);
};