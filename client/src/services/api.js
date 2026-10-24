import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor — attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agrivision_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — normalise errors ──────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired or invalid → clear storage and redirect to login
    if (error.response?.status === 401) {
      const isAuthRoute =
        window.location.pathname.includes('/login') ||
        window.location.pathname.includes('/register');
      if (!isAuthRoute) {
        localStorage.removeItem('agrivision_token');
        localStorage.removeItem('agrivision_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
