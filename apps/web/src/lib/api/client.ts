import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import type { ApiResponse } from "@health-portal/shared";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/**
 * Domain-level error raised for any non-success API response. Carries the
 * server envelope's `code` so callers can branch on it without reaching into
 * axios internals.
 */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Optional callback fired on any NOT_AUTHENTICATED response. Registered once
 * by the portal layout to clear the auth store + redirect to `/`, so every
 * page gets consistent expired-session handling without per-call checks.
 */
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // Send hp_session cookie on every request (cookie-based auth).
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 40000,
});

/**
 * Success interceptor: unwrap the `{ success, data }` envelope. A 2xx with
 * `success: false` still indicates a logical failure, so convert it into an
 * ApiError here rather than leaking the envelope to callers.
 */
http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    // 204 No Content — axios defaults `data` to "" here; normalize to
    // undefined so `api.delete()` honors its `Promise<void>` contract.
    if (response.status === 204) {
      (response as AxiosResponse<unknown>).data = undefined;
      return response;
    }
    const payload = response.data;
    if (payload && payload.success === false) {
      if (payload.error.code === "NOT_AUTHENTICATED") onUnauthorized?.();
      return Promise.reject(new ApiError(payload.error.code, payload.error.message, response.status));
    }
    // Replace envelope with the unwrapped data for downstream `.data` access.
    (response as AxiosResponse<unknown>).data = (payload as { success: true; data: unknown }).data;
    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;
    if (data && data.success === false) {
      if (data.error.code === "NOT_AUTHENTICATED") onUnauthorized?.();
      return Promise.reject(new ApiError(data.error.code, data.error.message, status));
    }
    return Promise.reject(new ApiError("NETWORK_ERROR", error.message, status));
  },
);

/** Typed helpers. Each returns the unwrapped `data` field directly. */
export const api = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return http.get<unknown, AxiosResponse<T>>(url, config).then((r) => r.data);
  },
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return http.post<unknown, AxiosResponse<T>>(url, data, config).then((r) => r.data);
  },
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return http.put<unknown, AxiosResponse<T>>(url, data, config).then((r) => r.data);
  },
  delete<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return http.delete<unknown, AxiosResponse<T>>(url, config).then((r) => r.data);
  },
};
