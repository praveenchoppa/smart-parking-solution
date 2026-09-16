import { apiClient, ENABLE_MOCK, throwApiError, getCurrentUserId } from './apiClient';
import { INITIAL_MOCK_VEHICLES } from '../mock/mockData';

let mockVehicles = [...INITIAL_MOCK_VEHICLES];

const ALLOWED_VEHICLE_TYPES = ['CAR', 'BIKE', 'SUV'];

function normalizeVehiclePayload(vehicleData) {
  const vehicleType = ALLOWED_VEHICLE_TYPES.includes(vehicleData.vehicleType)
    ? vehicleData.vehicleType
    : 'CAR';
  return {
    vehicleNumber: (vehicleData.vehicleNumber || '').trim().toUpperCase(),
    vehicleType
  };
}

export const vehicleApi = {
  getVehicles: async () => {
    try {
      const userId = getCurrentUserId();
      const response = await apiClient.get(`/api/users/${userId}/vehicles`);
      return response.data || [];
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 400));
        return mockVehicles;
      }
      throwApiError(error);
    }
  },

  addVehicle: async (vehicleData) => {
    try {
      const userId = getCurrentUserId();
      const response = await apiClient.post(
        `/api/users/${userId}/vehicles`,
        normalizeVehiclePayload(vehicleData)
      );
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 500));
        const payload = normalizeVehiclePayload(vehicleData);
        const newVehicle = {
          id: Date.now(),
          vehicleNumber: payload.vehicleNumber,
          vehicleType: payload.vehicleType
        };
        mockVehicles.push(newVehicle);
        return newVehicle;
      }
      throwApiError(error);
    }
  },

  updateVehicle: async (id, vehicleData) => {
    try {
      const userId = getCurrentUserId();
      const response = await apiClient.put(
        `/api/users/${userId}/vehicles/${id}`,
        normalizeVehiclePayload(vehicleData)
      );
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 400));
        const idx = mockVehicles.findIndex((v) => v.id === Number(id));
        if (idx !== -1) {
          mockVehicles[idx] = { ...mockVehicles[idx], ...normalizeVehiclePayload(vehicleData) };
          return mockVehicles[idx];
        }
        throw new Error("Vehicle not found");
      }
      throwApiError(error);
    }
  },

  deleteVehicle: async (id) => {
    try {
      const userId = getCurrentUserId();
      await apiClient.delete(`/api/users/${userId}/vehicles/${id}`);
      return { success: true };
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 400));
        mockVehicles = mockVehicles.filter((v) => v.id !== Number(id));
        return { success: true, message: "Vehicle deleted successfully." };
      }
      throwApiError(error);
    }
  }
};
