import { API_URL } from "../constants/api";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest(
  endpoint,
  method = "GET",
  body = null,
  token = null
) {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {
        message: "Invalid server response",
      };
    }

    if (!response.ok) {
      if (response.status === 401) {
        const isCredentialRequest =
          endpoint.startsWith("/auth/login") ||
          endpoint.startsWith("/auth/signup");

        throw new ApiError(
          isCredentialRequest
            ? data.message || "Invalid email or password"
            : "Session expired. Please log in again.",
          401
        );
      }

      throw new ApiError(
        data.message || "Something went wrong",
        response.status
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const message = error?.message || "";

    if (
      error?.name === "TypeError" ||
      message === "Failed to fetch" ||
      message === "Network request failed" ||
      message.includes("fetch")
    ) {
      throw new Error("Unable to connect to server");
    }

    throw error;
  }
}
