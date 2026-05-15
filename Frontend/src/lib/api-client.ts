import { logger } from "./logger";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api/v1", "") ||
  "https://api-wef5.onrender.com";

// Token management
// NOTE: Consider using httpOnly cookies for better security in production
// localStorage is vulnerable to XSS attacks
const TOKEN_KEY = "auth_token";

export const setAuthToken = (token: string) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    logger.error("Failed to store auth token", error);
  }
};

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    logger.error("Failed to retrieve auth token", error);
    return null;
  }
};

export const removeAuthToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    logger.error("Failed to remove auth token", error);
  }
};

export const apiFetch = async <T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...options.headers,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  // Auto-inject locale for backend multi-language support (Phase 7)
  const lang = localStorage.getItem("i18nextLng") || "am";
  headers["Accept-Language"] = lang;

  // Add Authorization header if token exists
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Prepend the base URL if the url doesn't already start with http
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: "include", // Essential for JWT cookies
    });

    // Handle empty responses (like 204 No Content)
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const errorMessage =
        data?.message || `HTTP ${response.status}: ${response.statusText}`;
      logger.apiError(url, new Error(errorMessage), {
        status: response.status,
        method: options.method || "GET",
      });
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error) {
    // Log network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      logger.apiError(url, error, {
        type: "network_error",
        method: options.method || "GET",
      });
    }
    throw error;
  }
};
