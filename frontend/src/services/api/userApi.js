import { apiClient, ENABLE_MOCK } from './apiClient';

export const userApi = {
  getUserProfile: async () => {
    try {
      const response = await apiClient.get('/api/user/profile');
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 300));
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : {
          id: 1,
          name: "John Doe",
          email: "user@parking.com",
          phone: "+91 9876543210",
          role: "USER"
        };
      }
      throw error;
    }
  },

  updateUserProfile: async (data) => {
    try {
      const response = await apiClient.put('/api/user/profile', data);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 400));
        return { ...data, success: true };
      }
      throw error;
    }
  }
};

export default userApi;
