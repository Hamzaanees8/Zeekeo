import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../routes/stores/useAuthStore";

const BASE_URL = import.meta.env.VITE_API_URL;

// Axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor – attach token
apiClient.interceptors.request.use(
  config => {
    const { sessionToken, loginAsSessionToken } = useAuthStore.getState();
    if (loginAsSessionToken) {
      config.headers["z-api-key"] = loginAsSessionToken;
    } else if (sessionToken) {
      config.headers["z-api-key"] = sessionToken;
    }
    return config;
  },
  error => Promise.reject(error),
);

let unauthorizedCount = 0;
let isRefreshing = false;
let refreshPromise = null;

// Response interceptor – handle 401 & refresh
apiClient.interceptors.response.use(
  response => {
    unauthorizedCount = 0;
    return response;
  },
  async error => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (!status) return Promise.reject(error); // Network or CORS

    if (status === 401 && useAuthStore.getState().loginAsSessionToken) {
      console.log("[Auth] 401 during login as — reverting to admin session");
      useAuthStore.getState().clearLoginAsToken();
      toast.error("Impersonation session expired. Back to admin.");
      window.location.href = "/admin/dashboard";
      return apiClient(originalRequest);
    }

    if (
      status === 401 &&
      !originalRequest?._retry &&
      !originalRequest.url.includes("/auth/")
    ) {
      originalRequest._retry = true;
      console.log(
        `[Auth] 401 received for ${originalRequest.url}, unauthorizedCount: ${unauthorizedCount}`,
      );

      if (unauthorizedCount >= 2) {
        // Too many retries → force logout
        console.log("[Auth] Too many retries (>=2), forcing logout");
        unauthorizedCount = 0;
        useAuthStore.getState().logout();
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing && refreshPromise) {
        console.log(
          "[Auth] Refresh already in progress, waiting for existing refresh...",
        );
        try {
          await refreshPromise;
          const { sessionToken } = useAuthStore.getState();
          originalRequest.headers["z-api-key"] = sessionToken;
          console.log("[Auth] Existing refresh completed, retrying request");
          return apiClient(originalRequest);
        } catch (err) {
          console.log("[Auth] Existing refresh failed, rejecting request");
          return Promise.reject(err);
        }
      }

      // Only increment counter when starting a NEW refresh (not when waiting)
      unauthorizedCount++;
      console.log(
        `[Auth] Incremented unauthorizedCount to: ${unauthorizedCount}`,
      );

      console.log("[Auth] Initiating new token refresh...");
      isRefreshing = true;
      refreshPromise = (async () => {
        try {
          const { refreshToken, setTokens, setUser } = useAuthStore.getState();
          console.log("[Auth] Calling /auth/refresh endpoint...");
          const response = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          const newToken = response.data.sessionToken;
          const newRefreshToken = response.data.refreshToken;

          setTokens(newToken, newRefreshToken);
          apiClient.defaults.headers.common["z-api-key"] = newToken;

          // Fetch updated user data after token refresh
          console.log("[Auth] Fetching updated user data...");
          const userResponse = await axios.get(`${BASE_URL}/users`, {
            headers: { "z-api-key": newToken },
          });
          setUser(userResponse.data.user);
          console.log("[Auth] User data updated in store");

          unauthorizedCount = 0;
          console.log(
            "[Auth] Token refresh successful, reset unauthorizedCount to 0",
          );
          return newToken;
        } catch (err) {
          console.error(
            "[Auth] Token refresh failed:",
            err?.response?.data || err,
          );
          useAuthStore.getState().logout();
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
          throw err;
        } finally {
          isRefreshing = false;
          refreshPromise = null;
          console.log("[Auth] Refresh promise cleanup complete");
        }
      })();

      try {
        const newToken = await refreshPromise;
        originalRequest.headers["z-api-key"] = newToken;
        console.log("[Auth] New token obtained, retrying original request");
        return apiClient(originalRequest);
      } catch (err) {
        console.log("[Auth] Failed to obtain new token, rejecting request");
        return Promise.reject(err);
      }
    }

    unauthorizedCount = 0;
    return Promise.reject(error);
  },
);

// Reusable request helpers
export const api = {
  get: async (url, config = {}) => (await apiClient.get(url, config)).data,
  post: async (url, data = {}, config = {}) =>
    (await apiClient.post(url, data, config)).data,
  put: async (url, data = {}, config = {}) =>
    (await apiClient.put(url, data, config)).data,
  delete: async (url, config = {}) =>
    (await apiClient.delete(url, config)).data,
  raw: apiClient,
};
