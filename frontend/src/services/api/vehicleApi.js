import { apiClient, shouldUseMock, getCurrentUserId, throwApiError } from './apiClient';
import { INITIAL_MOCK_VEHICLES } from '../mock/mockData';

let mockVehicles = [...INITIAL_MOCK_VEHICLES];

function vehiclesPath(suffix = '') {
  const userId = getCurrentUserId();
  return `/api/users/${userId}/vehicles${suffix}`;
}

export const vehicleApi = {
  getVehicles: async () => {
    try {
      const response = await apiClient.get(vehiclesPath());
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await new Promise((res) => setTimeout(res, 400));
        return mockVehicles;
      }
      throwApiError(error);
    }
  },

  addVehicle: async (vehicleData) => {
    try {
      const response = await apiClient.post(vehiclesPath(), vehicleData);
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await new Promise((res) => setTimeout(res, 500));
        const newVehicle = {
          id: Date.now(),
          vehicleNumber: vehicleData.vehicleNumber.toUpperCase(),
          vehicleType: vehicleData.vehicleType || 'CAR'
        };
        mockVehicles.push(newVehicle);
        return newVehicle;
      }
      throwApiError(error);
    }
  },

  updateVehicle: async (id, vehicleData) => {
    try {
      const response = await apiClient.put(vehiclesPath(`/${id}`), vehicleData);
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await new Promise((res) => setTimeout(res, 400));
        const idx = mockVehicles.findIndex((v) => v.id === Number(id));
        if (idx !== -1) {
          mockVehicles[idx] = { ...mockVehicles[idx], ...vehicleData };
          return mockVehicles[idx];
        }
        throw new Error('Vehicle not found');
      }
      throwApiError(error);
    }
  },

  deleteVehicle: async (id) => {
    try {
      const response = await apiClient.delete(vehiclesPath(`/${id}`));
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await new Promise((res) => setTimeout(res, 400));
        mockVehicles = mockVehicles.filter((v) => v.id !== Number(id));
        return { success: true, message: 'Vehicle deleted successfully.' };
      }
      throwApiError(error);
    }
  }
};
