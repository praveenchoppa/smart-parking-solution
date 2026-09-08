import { apiClient, ENABLE_MOCK } from './apiClient';
import { sharedMockRepository } from '../mock/mockData';

// Haversine distance calculator in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0.5;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return parseFloat(d.toFixed(1));
}

export const parkingApi = {
  getNearbyParkingAreas: async ({ latitude, longitude, radius = 500 }) => {
    try {
      const response = await apiClient.get('/api/parking-areas/nearby', {
        params: { latitude, longitude, radius }
      });
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 300));
        
        // Return shared parking areas enriched with calculated distance
        return sharedMockRepository.parkingAreas.map((p) => {
          let dist = p.distance;
          if (latitude && longitude && p.latitude && p.longitude) {
            const calculated = calculateDistance(latitude, longitude, p.latitude, p.longitude);
            dist = calculated > 0 ? calculated : p.distance || 0.5;
          }
          return {
            ...p,
            distance: dist || 0.5
          };
        });
      }
      throw error;
    }
  },

  getParkingDetails: async (id) => {
    try {
      const response = await apiClient.get(`/api/parking-areas/${id}`);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 300));
        const parking = sharedMockRepository.parkingAreas.find((p) => p.id === Number(id));
        if (!parking) throw new Error("Parking area not found");
        return parking;
      }
      throw error;
    }
  },

  getParkingSlots: async (parkingAreaId) => {
    try {
      const response = await apiClient.get(`/api/parking-areas/${parkingAreaId}/slots`);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 300));
        const slots = sharedMockRepository.slots[parkingAreaId] || [
          { slotId: Number(parkingAreaId) * 100 + 1, slotNumber: "S-01", status: "AVAILABLE" },
          { slotId: Number(parkingAreaId) * 100 + 2, slotNumber: "S-02", status: "OCCUPIED" },
          { slotId: Number(parkingAreaId) * 100 + 3, slotNumber: "S-03", status: "AVAILABLE" }
        ];
        return {
          parkingAreaId: Number(parkingAreaId),
          slots
        };
      }
      throw error;
    }
  }
};
