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

export function mapSlot(slot) {
  if (!slot) return slot;
  return {
    ...slot,
    slotId: slot.id,
    slotNumber: slot.slotNumber,
    status: slot.status
  };
}

export function occupancyFromSlots(slots, totalSlotsFromArea) {
  const list = slots || [];
  const availableSlots = list.filter((s) => s.status === 'AVAILABLE').length;
  const occupiedSlots = list.filter((s) => s.status === 'OCCUPIED').length;
  const reservedSlots = list.filter((s) => s.status === 'RESERVED').length;
  const totalSlots = totalSlotsFromArea ?? list.length;
  const occupancyPercentage = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;
  return { availableSlots, occupiedSlots, reservedSlots, occupancyPercentage };
}

export function mapParkingArea(area, occupancy = {}) {
  if (!area) return area;
  const distanceMeters = area.distanceMeters;
  return {
    ...area,
    distance: distanceMeters != null ? distanceMeters / 1000 : area.distance,
    availableSlots: occupancy.availableSlots,
    occupiedSlots: occupancy.occupiedSlots,
    occupancyPercentage: occupancy.occupancyPercentage
  };
}

export async function fetchSlotsForArea(parkingAreaId) {
  const response = await apiClient.get(`/api/parking-areas/${parkingAreaId}/slots`);
  const list = Array.isArray(response.data) ? response.data : [];
  return list.map(mapSlot);
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

  getAllParkingAreas: async () => {
    try {
      const response = await apiClient.get('/api/parking-areas');
      return response.data || [];
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 200));
        return sharedMockRepository.parkingAreas;
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
