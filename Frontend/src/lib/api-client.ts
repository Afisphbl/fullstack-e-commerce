export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...options.headers,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
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

  return data;
};
