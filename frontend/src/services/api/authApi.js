import { apiClient, ENABLE_MOCK } from './apiClient';

export const authApi = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        // Standalone Mock Auth for UI demo when backend is offline
        await new Promise((res) => setTimeout(res, 600));
        const { email, password } = credentials;
        if (email.toLowerCase().includes('admin')) {
          return {
            token: "mock-jwt-token-admin-123456789",
            user: {
              id: 999,
              name: "System Admin",
              email: email,
              role: "ADMIN"
            }
          };
        } else if (password && password.length >= 4) {
          return {
            token: "mock-jwt-token-user-987654321",
            user: {
              id: 1,
              name: email.split('@')[0] || "User",
              email: email,
              phone: "+91 9876543210",
              role: "USER"
            }
          };
        } else {
          throw new Error("Invalid email or password.");
        }
      }
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 700));
        return {
          token: "mock-jwt-token-user-new",
          user: {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: "USER"
          }
        };
      }
      throw error;
    }
  }
};
