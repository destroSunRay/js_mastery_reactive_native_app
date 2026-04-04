/**
 * Axios Configuration
 * Centralized HTTP client setup with interceptors for authentication and error handling
 */

import axios, {
  isAxiosError,
  type AxiosError,
  type AxiosResponse,
} from "axios";

import type { Paginated } from "@/types/paginated";
import { API_URL } from "./consts/env";

export const API_BASE_URL = API_URL;

/**
 * Create axios instance with default configuration
 */
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include auth cookies
});

/**
 * Request interceptor for authentication
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add any additional headers if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const { response } = error;

    // Handle different error scenarios
    if (response) {
      // Server responded with error status
      switch (response.status) {
        case 401:
          // Unauthorized - redirect to login
          console.error("Session expired. Please log in again.");
          // You might want to trigger a logout here
          // window.location.replace('/login');
          break;
        case 403:
          console.error("Access denied");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 422: {
          // Validation errors
          const errorData = response.data as { details?: string };
          if (errorData?.details) {
            console.error(`Validation error: ${errorData.details}`);
          } else {
            console.error("Invalid data provided");
          }
          break;
        }
        case 429:
          console.error("Too many requests. Please try again later.");
          break;
        case 500:
          console.error("Server error. Please try again later.");
          break;
        default:
          console.error("An unexpected error occurred");
      }
    } else if (error.request) {
      console.error("No response received:", error);
      // Network error
      console.error("Network error. Please check your connection.");
    } else {
      // Something else happened
      console.error("An unexpected error occurred");
    }

    return Promise.reject(error);
  },
);

/**
 * Enhanced API error class for better error handling
 */
export class ApiError extends Error {
  public status?: number;
  public code?: string;
  public details?: unknown;

  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Helper function to handle API responses
 */
export const handleApiResponse = <T>(
  response: AxiosResponse,
): T | Paginated<T> => {
  if (response.data?.success === false) {
    throw new ApiError(
      response.data.error || "API request failed",
      response.status,
      response.data.code,
      response.data.details,
    );
  }

  if (response.data?.pagination) {
    // Handle pagination if present
    const { pagination } = response.data;
    return {
      pagination,
      data: response.data?.data ?? response.data,
    };
  }

  return response.data?.data ?? response.data;
};

/**
 * Helper function to handle API errors
 */
export const handleApiError = (error: unknown): never => {
  if (isAxiosError(error)) {
    const { response } = error;
    if (response?.data) {
      throw new ApiError(
        response.data.error || response.data.message || "API request failed",
        response.status,
        response.data.code,
        response.data.details,
      );
    }
  }

  if (error instanceof Error) {
    throw new ApiError(error.message);
  }

  throw new ApiError("An unexpected error occurred");
};

export default apiClient;
