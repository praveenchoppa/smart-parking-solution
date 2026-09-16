import { apiClient, throwApiError } from './apiClient';

function normalizePhone(phone) {
  return (phone || '').replace(/\s+/g, '');
}

export const authApi = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.post('/api/auth/register', {
        name: userData.name,
        email: userData.email,
        phone: normalizePhone(userData.phone),
        password: userData.password
      });
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  }
};
