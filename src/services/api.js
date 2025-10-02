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
  (config) => {
    const { sessionToken } = useAuthStore.getState();
    if (sessionToken) {
      config.headers["z-api-key"] = sessionToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let unauthorizedCount = 0;
let isRefreshing = false;
let refreshPromise = null;

// Response interceptor – handle 401 & refresh
apiClient.interceptors.response.use(
  (response) => {
    unauthorizedCount = 0;
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (!status) return Promise.reject(error); // Network or CORS

    if (
      status === 401 &&
      !originalRequest?._retry &&
      !originalRequest.url.includes("/auth/")
    ) {
      originalRequest._retry = true;

      if (unauthorizedCount >= 2) {
        // Too many retries → force logout
        unauthorizedCount = 0;
        useAuthStore.getState().logout();
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      unauthorizedCount++;

      if (isRefreshing && refreshPromise) {
        try {
          await refreshPromise;
          const { sessionToken } = useAuthStore.getState();
          originalRequest.headers["z-api-key"] = sessionToken;
          return apiClient(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      isRefreshing = true;
      refreshPromise = (async () => {
        try {
          const { refreshToken, currentUser, setTokens } = useAuthStore.getState();
          const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          const newToken = response.data.sessionToken;
          const newRefreshToken = response.data.refreshToken;

          setTokens(newToken, newRefreshToken);
          apiClient.defaults.headers.common["z-api-key"] = newToken;

          unauthorizedCount = 0;
          return newToken;
        } catch (err) {
          console.error("Token refresh failed:", err?.response?.data || err);
          useAuthStore.getState().logout();
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
          throw err;
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      })();

      try {
        const newToken = await refreshPromise;
        originalRequest.headers["z-api-key"] = newToken;
        return apiClient(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    unauthorizedCount = 0;
    return Promise.reject(error);
  }
);

// Reusable request helpers
export const api = {
  get: async (url, config = {}) => (await apiClient.get(url, config)).data,
  post: async (url, data = {}, config = {}) => (await apiClient.post(url, data, config)).data,
  put: async (url, data = {}, config = {}) => (await apiClient.put(url, data, config)).data,
  delete: async (url, config = {}) => (await apiClient.delete(url, config)).data,
  raw: apiClient,
};
