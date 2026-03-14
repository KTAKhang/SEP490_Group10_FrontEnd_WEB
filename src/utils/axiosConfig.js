import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:3001";

// Tạo axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ===== Helpers =====
const getToken = () => {
  return localStorage.getItem("token");
};

const updateToken = (newToken) => {
  console.log(
    "🔄 Updating token:",
    newToken ? `${newToken.substring(0, 20)}...` : "null",
  );
  localStorage.setItem("token", newToken);
};

const clearAuthAndRedirect = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  setTimeout(() => {
    window.location.href = "/login";
  }, 2000);
};

// ===== REQUEST INTERCEPTOR =====
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ===== RESPONSE INTERCEPTOR =====
apiClient.interceptors.response.use(
  (response) => {
    const newToken = response.headers["new-access-token"];

    if (newToken) {
      updateToken(newToken);
    }

    return response;
  },

  async (error) => {
    const originalRequest = { ...error.config };

    const status = error.response?.status;
    const message = error.response?.data?.message;

    console.log("🔍 API ERROR:", status, message);

    /* =======================
       401 – TOKEN EXPIRED
    ======================== */
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );
        const newToken = refreshResponse.data?.token?.access_token;
        if (newToken) {
          updateToken(newToken);
          delete originalRequest.headers.Authorization;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        const refreshStatus = refreshError.response?.status;
        const refreshMessage = refreshError.response?.data?.message;

        console.log("❌ Refresh failed:", refreshStatus, refreshMessage);

        /* refresh token expired */
        if (
          refreshStatus === 401 &&
          refreshMessage === "The refresh token has expired."
        ) {
          toast.error("🚫 Login session has expired.");
          clearAuthAndRedirect();
          return;
        }

        clearAuthAndRedirect();

        return Promise.reject(refreshError);
      }
    }

    /* =======================
       403 – ACCOUNT LOCKED
    ======================== */
    if (status === 403 && message === "Account is locked") {
      toast.error("🚫 Your account has been locked by the admin");
      clearAuthAndRedirect();
      return;
    }

    /* =======================
       SINGLE LOGIN DETECTED
    ======================== */
    if (
      status === 401 &&
      message === "Your account has been logged in from elsewhere."
    ) {
      toast.error("🚫 Your account has been logged in from another device.");
      clearAuthAndRedirect();
      return;
    }

    /* =======================
       ACCESS DENIED
    ======================== */
    if (status === 403 && message === "Access denied") {
      toast.error("⛔ You do not have permission to access this function");
      return Promise.reject(error);
    }

    /* =======================
       SERVER ERROR
    ======================== */
    // if (status >= 500) {
    //   toast.error("🔥 Server error. Please try again later.");
    // }

    return Promise.reject(error);
  },
);

export default apiClient;
