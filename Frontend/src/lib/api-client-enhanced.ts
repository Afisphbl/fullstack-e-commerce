const API_BASE_URL = "https://api-wef5.onrender.com";

// Token management
const TOKEN_KEY = 'auth_token';

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Retry configuration
interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryableStatuses?: number[];
}

const defaultRetryConfig: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

// Sleep utility for retry delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced fetch with retry logic
export const apiFetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retryConfig: RetryConfig = {}
) => {
  const config = { ...defaultRetryConfig, ...retryConfig };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
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
      const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

      const response = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: "include",
      });

      // Handle empty responses (like 204 No Content)
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        // Check if we should retry this status code
        if (
          attempt < config.maxRetries &&
          config.retryableStatuses.includes(response.status)
        ) {
          lastError = new Error(data?.message || "An error occurred");
          await sleep(config.retryDelay * (attempt + 1)); // Exponential backoff
          continue;
        }

        throw new Error(data?.message || "An error occurred");
      }

      return data;
    } catch (error) {
      lastError = error as Error;

      // Network errors are retryable
      if (
        attempt < config.maxRetries &&
        (error instanceof TypeError || (error as any).name === 'NetworkError')
      ) {
        await sleep(config.retryDelay * (attempt + 1));
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error('Request failed after retries');
};

// Original apiFetch for backward compatibility
export const apiFetch = async (url: string, options: RequestInit = {}) => {
  return apiFetchWithRetry(url, options, { maxRetries: 0 });
};
