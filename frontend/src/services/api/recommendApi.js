import { apiClient } from './apiClient';

export const recommendApi = {
  getRecommendation: async ({ latitude, longitude, radius = 500, vehicleType }) => {
    const response = await apiClient.post('/api/ai/ai2/recommend', {
      latitude,
      longitude,
      radiusMeters: radius,
      vehicleType
    });
    return response.data;
  }
};
