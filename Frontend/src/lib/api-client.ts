const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api/v1", "") ||
  "https://api-wef5.onrender.com";

// Token management
const TOKEN_KEY = "auth_token";

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const apiFetch = async <T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<T> => {
  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...options.headers,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  // Add Authorization header if token exists
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Prepend the base URL if the url doesn't already start with http
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: "include", // Essential for JWT cookies
  });

  // Handle empty responses (like 204 No Content)
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "An error occurred");
  }

  return data as T;
};
