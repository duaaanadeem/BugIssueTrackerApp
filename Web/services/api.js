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

    const authToken =
      token ||
      (typeof window !== "undefined" ? localStorage.getItem("token") : null);

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
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

export const apiService = {
  // Auth
  login: (email, password) =>
    apiRequest("/auth/login", "POST", { email, password }),
  signup: (name, email, password) =>
    apiRequest("/auth/signup", "POST", { name, email, password }),
  getProfile: () => apiRequest("/users/me"),
  updateProfile: (userData) => apiRequest("/users/me", "PUT", userData),

  // Issues
  getIssues: (params = "") => apiRequest(`/issues${params}`),
  getIssueById: (id) => apiRequest(`/issues/${id}`),
  createIssue: (issueData) => apiRequest("/issues", "POST", issueData),
  updateIssue: (id, updates) => apiRequest(`/issues/${id}`, "PUT", updates),
  deleteIssue: (id) => apiRequest(`/issues/${id}`, "DELETE"),

  // Comments (matches router.post("/comments") and router.get("/:issueId/comments"))
  getComments: (issueId) => apiRequest(`/issues/${issueId}/comments`),
  addComment: (issueId, commentData) =>
    apiRequest("/issues/comments", "POST", {
      issueId,
      text: typeof commentData === "string" ? commentData : commentData.text,
    }),

  // History (matches router.get("/:issueId/history"))
  getIssueHistory: (issueId) => apiRequest(`/issues/${issueId}/history`),

  // Projects
  getProjects: () => apiRequest("/projects"),
  getProjectById: (id) => apiRequest(`/projects/${id}`),
  createProject: (projectData) =>
    apiRequest("/projects", "POST", projectData),
  getIssuesByProject: (projectId) =>
    apiRequest(`/issues?projectId=${projectId}`),
};

export default apiService;