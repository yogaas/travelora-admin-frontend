import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL = "https://yogaari-dev.biz.id";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach bearer token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh / 401s
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loops
    if (originalRequest.url === "/auth/refresh" || originalRequest.url === "/auth/login") {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = useAuthStore.getState().token;
        if (token) {
          // Attempt token refresh
          const res = await axios.post(
            `${API_BASE_URL}/api/v1/auth/refresh`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          
          const newToken = res.data.access_token;
          const user = useAuthStore.getState().user;
          
          if (user && newToken) {
            useAuthStore.getState().setAuth(newToken, user);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear auth and force login
        useAuthStore.getState().clearAuth();
      }
    }

    return Promise.reject(error);
  }
);
