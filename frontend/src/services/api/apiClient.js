import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const ENABLE_MOCK = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

function isPublicAuthUrl(url = '') {
  return url.includes('/api/auth/login') || url.includes('/api/auth/register');
}

apiClient.interceptors.request.use((config) => {
  if (!isPublicAuthUrl(config.url)) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    if (status === 401 && !isPublicAuthUrl(url)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export const extractErrorMessage = (error) => {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message;

    if (status === 409) {
      return message || "This slot was just booked by another user. Please select another slot.";
    }
    if (status === 401) {
      return message || "Session expired or invalid credentials. Please log in again.";
    }
    if (status === 403) {
      return "Access denied. You do not have permission to access this resource.";
    }
    if (status === 404) {
      return message || "The requested resource could not be found.";
    }
    if (status === 400) {
      return message || "Invalid data submitted. Please check your inputs.";
    }
    if (status >= 500) {
      return "Server error occurred. Please try again later.";
    }
    return message || `Request failed with status ${status}`;
  } else if (error.request) {
    return "Unable to reach Spring Boot backend server.";
  }
  return error.message || "An unexpected error occurred.";
};

export function throwApiError(error) {
  const err = new Error(extractErrorMessage(error));
  err.response = error.response;
  err.status = error.response?.status;
  throw err;
}

export function getCurrentUserId() {
  const saved = localStorage.getItem('user');
  if (!saved) {
    throw new Error('No active user session. Please log in.');
  }
  const user = JSON.parse(saved);
  if (!user?.id) {
    throw new Error('No active user session. Please log in.');
  }
  return user.id;
}

export { apiClient, BASE_URL, ENABLE_MOCK };
