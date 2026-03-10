import { User, PaySlip, PaySlipsResponse } from "../types";
import { API_CONFIG } from "../constants";

// API base URL configuration:
// - VITE_API_BASE env var takes precedence
// - In development: defaults to configured dev API base
// - In production: defaults to /api
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ||
  ((import.meta as any).env?.DEV ? API_CONFIG.DEV_API_BASE : "/api");

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// simple sleep utility
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// wrapper around fetch that retries on network errors or 504 gateway timeout
async function fetchWithRetry(
  input: RequestInfo,
  init?: RequestInit,
  maxAttempts = API_CONFIG.MAX_RETRY_ATTEMPTS,
  retryDelay = API_CONFIG.RETRY_DELAY_MS,
): Promise<Response> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(input, init);

      // retry on transient server errors
      if (
        attempt < maxAttempts &&
        response.status >= 500 &&
        response.status < 600
      ) {
        console.warn(
          `Server error ${response.status} for ${input}, retrying (${attempt}/${maxAttempts})...`,
        );
        await sleep(retryDelay);
        continue;
      }

      return response;
    } catch (err) {
      // network errors (TypeError) or aborts
      if (
        (err instanceof TypeError || (err as any).name === "AbortError") &&
        attempt < maxAttempts
      ) {
        console.warn(
          `Network error for ${input}, retrying (${attempt}/${maxAttempts})...`,
        );
        await sleep(retryDelay);
        continue;
      }
      throw err;
    }
  }
  // should not reach here
  throw new ApiError(500, "Failed to fetch resource");
}

async function request<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  // Validate token before making request
  if (!token || token.trim() === "") {
    throw new ApiError(401, "Authentication token is required");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const response = await fetchWithRetry(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = "An unexpected error occurred";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText;
      }
      throw new ApiError(response.status, errorMessage);
    }

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    const text = await response.text();
    if (!text) return undefined as unknown as T;
    return JSON.parse(text) as T;
  } catch (err) {
    // Ensure API errors are propagated, wrap other errors
    if (err instanceof ApiError) {
      throw err;
    }
    // Could be network failure after retries
    throw new ApiError(500, (err as Error).message || "Request failed");
  }
}

export const api = {
  getMe: async (token: string): Promise<User> => {
    return request<User>("/me", token);
  },

  getPayslips: async (
    token: string,
    params?: { limit?: number; cursor?: string },
  ): Promise<PaySlipsResponse> => {
    const query = new URLSearchParams();
    if (params?.limit) {
      query.set("limit", String(params.limit));
    }
    if (params?.cursor) {
      query.set("cursor", params.cursor);
    }

    const endpoint = query.toString()
      ? `/pay-slips?${query.toString()}`
      : "/pay-slips";
    return request<PaySlipsResponse>(endpoint, token);
  },

  getPayslipById: async (token: string, id: string): Promise<PaySlip> => {
    return request<PaySlip>(`/pay-slips/${id}`, token);
  },

  // Admin endpoints
  getUsers: async (token: string): Promise<User[]> => {
    return request<User[]>("/users", token);
  },

  // Two-step upload process
  uploadFile: async (
    token: string,
    file: File,
  ): Promise<{ filePath: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = "File upload failed";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText;
      }
      throw new ApiError(response.status, errorMessage);
    }

    return response.json();
  },

  createPayslip: async (
    token: string,
    data: {
      userId: string;
      month: number;
      year: number;
      filePath: string;
    },
  ): Promise<PaySlip> => {
    return request<PaySlip>("/pay-slips", token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  deletePayslip: async (token: string, id: string): Promise<void> => {
    return request<void>(`/pay-slips/${id}`, token, {
      method: "DELETE",
    });
  },
};
