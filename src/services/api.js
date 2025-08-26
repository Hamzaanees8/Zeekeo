import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// Axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor – attach token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem("sessionToken");
    if (token) {
      config.headers["z-api-key"] = token;
    }
    return config;
  },
  error => Promise.reject(error),
);

let unauthorizedCount = 0;

apiClient.interceptors.response.use(
  response => {
    // Reset counter if request succeeds
    unauthorizedCount = 0;
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // No response (network / CORS)
    if (!error.response) {
      const token = localStorage.getItem("sessionToken"); 
      if (token && !originalRequest.url.includes("/auth/")) {
        console.warn("ERR_NETWORK but token present  treating as 401");
        unauthorizedCount++;
      } else {
        console.error("Pure network error:", error.message);
        return Promise.reject(error);
      }
    }

    const status = error?.response?.status;

    // Handle 401 only
    if (
      (status === 401 || unauthorizedCount > 0) &&
      !originalRequest?._retry &&
      !originalRequest.url.includes("/auth/")
    ) {
      originalRequest._retry = true;

      // Allow only up to 2 retries (401 then refresh, then retry request)
      if (unauthorizedCount <= 2) {
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          const response = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const newToken = response.data.sessionToken;
          localStorage.setItem("sessionToken", newToken);

          apiClient.defaults.headers.common["z-api-key"] = newToken;
          originalRequest.headers["z-api-key"] = newToken;

          return apiClient(originalRequest);
        } catch (err) {
          console.error("Token refresh failed:", err?.response?.data || err);
          unauthorizedCount = 0; // reset counter on logout
          localStorage.clear();
          window.location.href = "/login";
        }
      } else {
        // Too many 401s → force logout
        unauthorizedCount = 0;
        localStorage.clear();
        window.location.href = "/login";
      }
    } else if (status !== 401) {
      // Reset counter if it's not a 401
      unauthorizedCount = 0;
    }

    return Promise.reject(error);
  },
);

// Reusable request helpers
export const api = {
  get: async (url, config = {}) => {
    const res = await apiClient.get(url, config);
    return res.data;
  },
  post: async (url, data = {}, config = {}) => {
    const res = await apiClient.post(url, data, config);
    return res.data;
  },
  put: async (url, data = {}, config = {}) => {
    const res = await apiClient.put(url, data, config);
    return res.data;
  },
  delete: async (url, config = {}) => {
    const res = await apiClient.delete(url, config);
    return res.data;
  },
  raw: apiClient, // Expose original axios instance (optional)
};
