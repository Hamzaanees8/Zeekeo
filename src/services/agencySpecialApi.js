import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../routes/stores/useAuthStore";

// Determine API base URL based on current domain
// - Main domain (zeekeo.com): Use direct API URL
// - Whitelabel domains: Use relative /api path (routed through CloudFront)
const getBaseUrl = () => {
  const hostname = window.location.hostname;

  // TODO: Remove this once we have a proper whitelabel domain
  if (hostname.includes("test-wl.launchpad.zeekeo.com")) {
    return "/api";
  }

  // Local development or main domain - use configured API URL
  if (
    hostname === "localhost" ||
    hostname.includes("127.0.0.1") ||
    hostname.includes("zeekeo.com")
  ) {
    return import.meta.env.VITE_API_URL;
  }

  // Whitelabel domain - use relative path (CloudFront routes /api/* to API Gateway)
  return "/api";
};

const BASE_URL = getBaseUrl();

// only Axios instance - uses ORIGINAL token only
export const agencyApiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor – strictly use ORIGINAL token
agencyApiClient.interceptors.request.use(
  config => {
    const { originalSessionToken } = useAuthStore.getState();

    if (!originalSessionToken) {
      console.error("[agencyApi] No original token available");
      throw new axios.Cancel("No token available");
    }

    config.headers["z-api-key"] = originalSessionToken;
    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor – handle token refresh using original refresh token
agencyApiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (!status) return Promise.reject(error);

    // Handle 401 for token refresh
    if (
      status === 401 &&
      !originalRequest?._retry &&
      !originalRequest.url.includes("/auth/")
    ) {
      originalRequest._retry = true;
      console.log(`[agencyApi] 401 received for ${originalRequest.url}`);

      try {
        const store = useAuthStore.getState();
        const { originalRefreshToken } = store;

        if (!originalRefreshToken) {
          throw new Error("No original refresh token available");
        }

        console.log("[agencyApi] Refreshing original token...");
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken: originalRefreshToken,
        });

        const newToken = response.data.sessionToken;
        const newRefreshToken = response.data.refreshToken;

        // Update original tokens in store
        store.setTokens(newToken, newRefreshToken);
        console.log("[agencyApi] Updated original tokens");

        // Update the original request with new token
        originalRequest.headers["z-api-key"] = newToken;

        // Retry the original request
        return agencyApiClient(originalRequest);
      } catch (refreshError) {
        console.error("[agencyApi] Token refresh failed:", refreshError);

        // Clear everything and redirect to login
        useAuthStore.getState().logout();
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

//  API helpers
export const agencyApi = {
  get: async (url, config = {}) => {
    const response = await agencyApiClient.get(url, config);
    return response.data;
  },
  post: async (url, data = {}, config = {}) => {
    const response = await agencyApiClient.post(url, data, config);
    return response.data;
  },
  put: async (url, data = {}, config = {}) => {
    const response = await agencyApiClient.put(url, data, config);
    return response.data;
  },
  delete: async (url, config = {}) => {
    const response = await agencyApiClient.delete(url, config);
    return response.data;
  },
  raw: agencyApiClient,
};
