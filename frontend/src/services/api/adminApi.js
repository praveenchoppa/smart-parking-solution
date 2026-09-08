import { apiClient, ENABLE_MOCK } from './apiClient';
import { sharedMockRepository, INITIAL_AI3_PREDICTIONS } from '../mock/mockData';

export const adminApi = {
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/api/admin/dashboard');
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 300));
        let totalSlots = 0;
        let availableSlots = 0;
        let occupiedSlots = 0;
        let reservedSlots = 0;

        sharedMockRepository.parkingAreas.forEach((p) => {
          totalSlots += p.totalSlots;
          availableSlots += p.availableSlots;
          occupiedSlots += p.occupiedSlots || 0;
          reservedSlots += Math.max(0, p.totalSlots - p.availableSlots - (p.occupiedSlots || 0));
        });

        return {
          totalParkingAreas: sharedMockRepository.parkingAreas.length,
          totalSlots,
          availableSlots,
          occupiedSlots,
          reservedSlots,
          activeBookings: sharedMockRepository.bookings.filter((b) => b.status === "PENDING_CHECK_IN" || b.status === "CHECKED_IN").length,
          completedBookings: sharedMockRepository.bookings.filter((b) => b.status === "COMPLETED").length,
          totalRevenue: sharedMockRepository.bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
          overallOccupancyPercentage: Math.round((occupiedSlots / (totalSlots || 1)) * 100),
          ai3Predictions: INITIAL_AI3_PREDICTIONS
        };
      }
      throw error;
    }
  },

  getParkingAreas: async () => {
    try {
      const response = await apiClient.get('/api/admin/parking-areas');
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 200));
        return sharedMockRepository.parkingAreas;
      }
      throw error;
    }
  },

  createParkingArea: async (data) => {
    try {
      const response = await apiClient.post('/api/admin/parking-areas', data);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 300));

        const trimmedName = (data.name || '').trim();
        const trimmedAddress = (data.address || '').trim();

        // Guard against duplicate creation
        const existing = sharedMockRepository.parkingAreas.find(
          (p) => p.name.toLowerCase() === trimmedName.toLowerCase() && p.address.toLowerCase() === trimmedAddress.toLowerCase()
        );
        if (existing) {
          return existing;
        }

        const newId = Date.now();
        const totalSlots = parseInt(data.totalSlots, 10) || 20;

        const newParking = {
          id: newId,
          name: trimmedName,
          address: trimmedAddress,
          latitude: parseFloat(data.latitude) || 12.9716,
          longitude: parseFloat(data.longitude) || 77.5946,
          distance: 0.5,
          hourlyRate: parseFloat(data.hourlyRate) || 40,
          totalSlots: totalSlots,
          availableSlots: totalSlots,
          occupiedSlots: 0,
          occupancyPercentage: 0,
          status: "OPEN"
        };

        sharedMockRepository.parkingAreas.push(newParking);

        sharedMockRepository.slots[newId] = Array.from({ length: totalSlots }, (_, i) => ({
          slotId: newId * 100 + i + 1,
          slotNumber: `S-${String(i + 1).padStart(2, '0')}`,
          status: "AVAILABLE"
        }));

        return newParking;
      }
      throw error;
    }
  },

  updateParkingArea: async (id, data) => {
    try {
      const response = await apiClient.put(`/api/admin/parking-areas/${id}`, data);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 300));
        const idx = sharedMockRepository.parkingAreas.findIndex((p) => p.id === Number(id));
        if (idx !== -1) {
          sharedMockRepository.parkingAreas[idx] = {
            ...sharedMockRepository.parkingAreas[idx],
            ...data,
            latitude: parseFloat(data.latitude) || sharedMockRepository.parkingAreas[idx].latitude,
            longitude: parseFloat(data.longitude) || sharedMockRepository.parkingAreas[idx].longitude,
            hourlyRate: parseFloat(data.hourlyRate) || sharedMockRepository.parkingAreas[idx].hourlyRate,
            totalSlots: parseInt(data.totalSlots, 10) || sharedMockRepository.parkingAreas[idx].totalSlots
          };
          return sharedMockRepository.parkingAreas[idx];
        }
        throw new Error("Parking area not found");
      }
      throw error;
    }
  },

  deleteParkingArea: async (id) => {
    try {
      const response = await apiClient.delete(`/api/admin/parking-areas/${id}`);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 300));
        sharedMockRepository.parkingAreas = sharedMockRepository.parkingAreas.filter((p) => p.id !== Number(id));
        delete sharedMockRepository.slots[id];
        return { success: true, message: "Parking area removed successfully." };
      }
      throw error;
    }
  },

  getSlots: async (parkingAreaId) => {
    try {
      const response = await apiClient.get(`/api/admin/parking-areas/${parkingAreaId}/slots`);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 300));
        return sharedMockRepository.slots[parkingAreaId] || [];
      }
      throw error;
    }
  },

  getAllBookings: async () => {
    try {
      const response = await apiClient.get('/api/admin/bookings');
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 300));
        return sharedMockRepository.bookings;
      }
      throw error;
    }
  },

  processCheckIn: async (bookingCode) => {
    try {
      const response = await apiClient.post('/api/check-in', { bookingCode });
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 500));
        const booking = sharedMockRepository.bookings.find(
          (b) => b.bookingCode === bookingCode || b.bookingCode.toLowerCase() === bookingCode.toLowerCase()
        );

        if (!booking) {
          return {
            status: "NOT_FOUND",
            message: `Booking code '${bookingCode}' was not found in the system.`
          };
        }

        if (booking.status === "CHECKED_IN") {
          return {
            status: "ALREADY_CHECKED_IN",
            bookingCode: booking.bookingCode,
            bookingId: booking.id,
            parkingAreaName: booking.parkingAreaName,
            slotNumber: booking.slotNumber,
            vehicleNumber: booking.vehicleNumber,
            message: "User has already checked in with this pass."
          };
        }

        if (booking.status === "COMPLETED") {
          return {
            status: "COMPLETED",
            bookingCode: booking.bookingCode,
            message: "This booking session has already been completed."
          };
        }

        if (booking.status === "CANCELLED") {
          return {
            status: "CANCELLED",
            message: "This booking was cancelled and is invalid for check-in."
          };
        }

        if (booking.paymentStatus === "UNPAID") {
          return {
            status: "UNPAID",
            message: "Payment has not been completed for this booking."
          };
        }

        booking.status = "CHECKED_IN";
        booking.checkInTime = new Date().toISOString();

        return {
          status: "VALID",
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          parkingAreaName: booking.parkingAreaName,
          slotNumber: booking.slotNumber,
          vehicleNumber: booking.vehicleNumber,
          durationHours: booking.durationHours,
          totalAmount: booking.totalAmount,
          message: "Check-in successful! Gate access granted."
        };
      }
      throw error;
    }
  },

  completeBookingSession: async (bookingId) => {
    try {
      const response = await apiClient.post(`/api/admin/bookings/${bookingId}/complete`);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 400));
        const booking = sharedMockRepository.bookings.find((b) => b.id === Number(bookingId));
        if (booking) {
          booking.status = "COMPLETED";
          booking.completedTime = new Date().toISOString();
        }
        return { success: true, message: "Booking session marked as COMPLETED." };
      }
      throw error;
    }
  },

  getPredictionReports: async () => {
    try {
      const response = await apiClient.get('/api/admin/reports/predictions');
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 300));
        return INITIAL_AI3_PREDICTIONS;
      }
      throw error;
    }
  }
};
