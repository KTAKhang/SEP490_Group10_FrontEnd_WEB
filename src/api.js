// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001", // backend của bạn
  withCredentials: true, // nếu dùng cookie
});

// nếu dùng Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
