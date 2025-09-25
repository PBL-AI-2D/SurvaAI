import axios from 'axios';
import { useAuthStore } from '@/features/auth/stores/store';
import { authService } from '@/features/auth/api/api';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

export const pythonApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PYTHON_SERVICE_API_BASE_URL,
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const message = error?.response?.message;

    if (message === 'jwt expired' && !originalRequest._retry) {
      originalRequest._retry = true;
      const { setAccessToken, clearAccessToken, accessToken } = useAuthStore.getState();

      if (!accessToken) {
        clearAccessToken();
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const res = await authService.refreshToken();
          const newToken = res.data?.accessToken;
          if (!newToken) throw new Error('No token returned from refresh');

          setAccessToken(newToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          clearAccessToken();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
