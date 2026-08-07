import axios from 'axios';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage or cookies if needed
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    // Only set Authorization if it has not been explicitly provided
    if (token && !config.headers?.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('userData');
        // Clear all cookies
        const pastDate = new Date(0).toUTCString(); // Unix epoch — forces immediate expiry
        document.cookie.split(';').forEach((cookie) => {
          const name = cookie.split('=')[0].trim();
          document.cookie = `${name}=;expires=${pastDate};path=/`;
        });
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
