import axios from "axios";

const axiosPrivate = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosPrivate.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for token refresh logic
axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Prevent infinite loop
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // For GCT-STEP, we'll handle token refresh differently
        // You can implement refresh token logic here if needed
        localStorage.removeItem("token");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      } catch (refreshError) {
        // Refresh failed: clear tokens and redirect to login
        localStorage.removeItem("token");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosPrivate; 