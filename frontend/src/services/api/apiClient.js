import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const ENABLE_MOCK = import.meta.env.VITE_ENABLE_MOCK_FALLBACK !== 'false';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Request Interceptor: Attach JWT Token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to extract user-friendly error messages
export const extractErrorMessage = (error) => {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message;

    if (status === 409) {
      return message || "This slot was just booked by another user. Please select another slot.";
    }
    if (status === 401) {
      return "Session expired or invalid credentials. Please log in again.";
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
    return "Unable to reach Spring Boot backend server. (Offline Mode Active)";
  }
  return error.message || "An unexpected error occurred.";
};

export { apiClient, BASE_URL, ENABLE_MOCK };
