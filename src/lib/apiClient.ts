import axios, { AxiosInstance } from 'axios';
import ENV from '../config/env';
import { secureRetrieveToken } from './security';

// Simple Axios wrapper with interceptors
const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: inject token if present
apiClient.interceptors.request.use((config) => {
  // NOTE: For production, prefer HTTP-only secure cookies set by the server.
  const token = secureRetrieveToken();
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: central error handling
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    // Add centralized error handling / logging here
    return Promise.reject(error);
  }
);

export default apiClient;
