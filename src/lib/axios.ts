import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ---------------------------------------------------------------------------
// Standard API response envelope (matches your backend's response shape)
// ---------------------------------------------------------------------------
export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

// ---------------------------------------------------------------------------
// In-memory access token store
//
// WHY NOT localStorage:
// Any XSS vector (a malicious npm package, an unsanitized user-generated
// field rendered somewhere, a compromised third-party script) can read
// localStorage synchronously. A JS variable held in a module closure is not
// reachable through document/storage APIs, which removes that entire attack
// surface. The trade-off is that the token is lost on a hard page refresh —
// we recover from that by calling /auth/refresh-token once on app boot
// (do this in your app's root layout / AuthProvider, not in this file).
// ---------------------------------------------------------------------------
let accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const getAccessToken = (): string | null => accessToken;

// ---------------------------------------------------------------------------
// Auth-failure hook
//
// WHY NOT window.location.href here:
// This file shouldn't own navigation decisions — that couples a low-level
// HTTP client to routing/UI concerns and forces a full page reload (killing
// SPA state, in-flight requests, unsaved form data, etc). Instead we expose
// a hook the app layer wires up once (e.g. to router.push('/login') plus
// clearing your auth context/store).
// ---------------------------------------------------------------------------
type AuthFailureHandler = () => void;
let onAuthFailure: AuthFailureHandler | null = null;

export const setAuthFailureHandler = (handler: AuthFailureHandler): void => {
  onAuthFailure = handler;
};

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // sends the httpOnly refresh-token cookie automatically
  timeout: 15000, // fail fast instead of hanging indefinitely on a dead backend
});

// Extend Axios's config type with our custom retry-tracking flags instead of
// using `any` — keeps the rest of the file fully typed.
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _isRefreshRequest?: boolean;
}

// ---------------------------------------------------------------------------
// Request interceptor: attach access token from memory
// ---------------------------------------------------------------------------
axiosInstance.interceptors.request.use(
  (config) => {
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Refresh queuing
//
// WHY THIS EXISTS:
// If 5 requests fail with 401 at nearly the same moment (common right after
// a token expires and a page fires several parallel API calls), each one
// hitting /refresh-token independently causes:
//   1) unnecessary load on the auth service
//   2) a race condition if your refresh tokens are single-use/rotating —
//      requests 2-5 will get a "token already used" error and log the user
//      out incorrectly, even though request 1 succeeded.
// The fix: only the first 401 triggers a real refresh call. Every other
// request that arrives while a refresh is already in flight subscribes to
// the result and replays itself once the new token is available.
// ---------------------------------------------------------------------------
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (callback: (token: string) => void): void => {
  refreshSubscribers.push(callback);
};

const notifySubscribers = (token: string): void => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// ---------------------------------------------------------------------------
// Response interceptor
// ---------------------------------------------------------------------------
axiosInstance.interceptors.response.use(
  // Unwrapping response.data here is fine, but ONLY if every caller in the
  // app treats axiosInstance.get<T>(...) as returning ApiResponse<T> (not
  // AxiosResponse<ApiResponse<T>>). Enforce that via a typed wrapper — see
  // the `api` helper exported at the bottom of this file — rather than
  // trusting every call site to remember.
  (response) => response.data,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    // No response at all (network error, timeout, CORS failure) or this
    // *is* the refresh call itself failing — don't attempt to refresh.
    if (!error.response || !originalRequest || originalRequest._isRefreshRequest) {
      return Promise.reject(error);
    }

    // Only 401 (unauthenticated / expired token) warrants a refresh attempt.
    // 403 (forbidden) means the user IS authenticated but lacks permission —
    // refreshing the token will never fix that, so let it propagate as-is
    // for the UI to show a "not authorized" message.
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // A refresh is already in flight — wait for it instead of firing
        // a second /refresh-token call.
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          });
          // If the in-flight refresh ultimately fails, onAuthFailure will
          // fire and clear subscribers; this promise will simply never
          // resolve, which is acceptable since navigation to /login is
          // about to happen anyway. If you need stricter cleanup, track
          // rejection via a shared refreshPromise instead of the callback
          // array shown here.
        });
      }

      isRefreshing = true;

      try {
        const refreshConfig = {
          _isRefreshRequest: true,
        } as RetryableRequestConfig;

        const refreshResponse = (await axiosInstance.post(
          '/auth/refresh-token',
          {},
          refreshConfig,
        )) as unknown as ApiResponse<{ accessToken: string }>;

        const newAccessToken = refreshResponse?.data?.accessToken;
        if (!newAccessToken) {
          throw new Error('Refresh response did not contain an access token');
        }

        setAccessToken(newAccessToken);
        notifySubscribers(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        refreshSubscribers = [];
        onAuthFailure?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;

// ---------------------------------------------------------------------------
// Typed convenience wrapper
//
// Because the response interceptor unwraps to ApiResponse<T> at runtime,
// axiosInstance.get<T>() is a type lie (it claims AxiosResponse<T>). Route
// all calls through this instead so the compiler and runtime agree.
// ---------------------------------------------------------------------------
export const api = {
  get: <T>(url: string, config?: Parameters<typeof axiosInstance.get>[1]) =>
    axiosInstance.get(url, config) as unknown as Promise<ApiResponse<T>>,
  post: <T>(url: string, data?: unknown, config?: Parameters<typeof axiosInstance.post>[2]) =>
    axiosInstance.post(url, data, config) as unknown as Promise<ApiResponse<T>>,
  put: <T>(url: string, data?: unknown, config?: Parameters<typeof axiosInstance.put>[2]) =>
    axiosInstance.put(url, data, config) as unknown as Promise<ApiResponse<T>>,
  patch: <T>(url: string, data?: unknown, config?: Parameters<typeof axiosInstance.patch>[2]) =>
    axiosInstance.patch(url, data, config) as unknown as Promise<ApiResponse<T>>,
  delete: <T>(url: string, config?: Parameters<typeof axiosInstance.delete>[1]) =>
    axiosInstance.delete(url, config) as unknown as Promise<ApiResponse<T>>,
};