import { apiClient, ENABLE_MOCK } from './apiClient';
import { INITIAL_MOCK_VEHICLES } from '../mock/mockData';

let mockVehicles = [...INITIAL_MOCK_VEHICLES];

export const vehicleApi = {
  getVehicles: async () => {
    try {
      const response = await apiClient.get('/api/vehicles');
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 400));
        return mockVehicles;
      }
      throw error;
    }
  },

  addVehicle: async (vehicleData) => {
    try {
      const response = await apiClient.post('/api/vehicles', vehicleData);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 500));
        const newVehicle = {
          id: Date.now(),
          vehicleNumber: vehicleData.vehicleNumber.toUpperCase(),
          vehicleType: vehicleData.vehicleType || 'CAR'
        };
        mockVehicles.push(newVehicle);
        return newVehicle;
      }
      throw error;
    }
  },

  updateVehicle: async (id, vehicleData) => {
    try {
      const response = await apiClient.put(`/api/vehicles/${id}`, vehicleData);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 400));
        const idx = mockVehicles.findIndex((v) => v.id === Number(id));
        if (idx !== -1) {
          mockVehicles[idx] = { ...mockVehicles[idx], ...vehicleData };
          return mockVehicles[idx];
        }
        throw new Error("Vehicle not found");
      }
      throw error;
    }
  },

  deleteVehicle: async (id) => {
    try {
      const response = await apiClient.delete(`/api/vehicles/${id}`);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 400));
        mockVehicles = mockVehicles.filter((v) => v.id !== Number(id));
        return { success: true, message: "Vehicle deleted successfully." };
      }
      throw error;
    }
  }
};
