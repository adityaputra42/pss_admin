import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '../hooks/useAuth';

/* ============================
   Axios typing extension
============================ */
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

/* ============================
   Base URL
============================ */
const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

/* ============================
   Axios instance
============================ */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

/* ============================
   REQUEST INTERCEPTOR
============================ */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 🚫 JANGAN PASANG TOKEN SAAT LOGIN / REFRESH
    if (
      config.url?.includes('/auth/admin/login') ||
      config.url?.includes('/auth/refresh')
    ) {
      delete config.headers.Authorization;
      return config;
    }

    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ============================
   RESPONSE INTERCEPTOR
============================ */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;
    const status = error.response?.status;

    if (
      status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/auth/admin/login')
    ) {
      originalRequest._retry = true;

      const {
        refreshToken,
        setTokens,
        logout,
      } = useAuthStore.getState();

      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        );

        const { access_token, refresh_token } = refreshResponse.data.data;

        setTokens(access_token, refresh_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        return api(originalRequest);
      } catch (refreshError) {
        logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
