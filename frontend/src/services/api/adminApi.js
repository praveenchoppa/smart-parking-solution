import { apiClient, ENABLE_MOCK, throwApiError, extractErrorMessage } from './apiClient';
import { sharedMockRepository, INITIAL_AI3_PREDICTIONS } from '../mock/mockData';
import { parkingApi, fetchSlotsForArea, occupancyFromSlots, mapParkingArea } from './parkingApi';
import { mapBooking } from './bookingApi';

function toParkingAreaPayload(data) {
  return {
    name: (data.name || '').trim(),
    address: (data.address || '').trim(),
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude),
    hourlyRate: parseFloat(data.hourlyRate),
    totalSlots: parseInt(data.totalSlots, 10)
  };
}

async function fetchAllBookings() {
  const usersResponse = await apiClient.get('/api/users');
  const users = usersResponse.data || [];
  const nested = await Promise.all(
    users.map(async (user) => {
      const response = await apiClient.get(`/api/users/${user.id}/bookings`);
      return (response.data || []).map(mapBooking);
    })
  );
  return nested.flat();
}

async function createSlotsForArea(parkingAreaId, totalSlots) {
  const count = Number(totalSlots) || 0;
  for (let i = 1; i <= count; i++) {
    await apiClient.post(`/api/parking-areas/${parkingAreaId}/slots`, {
      slotNumber: `S-${String(i).padStart(2, '0')}`,
      status: 'AVAILABLE'
    });
  }
}

export const adminApi = {
  getDashboardStats: async () => {
    try {
      const areas = await parkingApi.getAllParkingAreas();
      const bookings = await fetchAllBookings();

      let totalSlots = 0;
      let availableSlots = 0;
      let occupiedSlots = 0;
      let reservedSlots = 0;

      areas.forEach((p) => {
        totalSlots += p.totalSlots || 0;
        availableSlots += p.availableSlots || 0;
        occupiedSlots += p.occupiedSlots || 0;
        reservedSlots += Math.max(
          0,
          (p.totalSlots || 0) - (p.availableSlots || 0) - (p.occupiedSlots || 0)
        );
      });

      return {
        totalParkingAreas: areas.length,
        totalSlots,
        availableSlots,
        occupiedSlots,
        reservedSlots,
        activeBookings: bookings.filter(
          (b) => b.status === 'PENDING_CHECK_IN' || b.status === 'CHECKED_IN'
        ).length,
        completedBookings: bookings.filter((b) => b.status === 'COMPLETED').length,
        totalRevenue: bookings
          .filter((b) => b.status !== 'PENDING_PAYMENT' && b.status !== 'CANCELLED')
          .reduce((sum, b) => sum + Number(b.totalAmount || b.amount || 0), 0),
        overallOccupancyPercentage: Math.round((occupiedSlots / (totalSlots || 1)) * 100)
      };
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
      throwApiError(error);
    }
  },

  getParkingAreas: async () => {
    try {
      return await parkingApi.getAllParkingAreas();
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 200));
        return sharedMockRepository.parkingAreas;
      }
      throwApiError(error);
    }
  },

  createParkingArea: async (data) => {
    try {
      const payload = toParkingAreaPayload(data);
      const response = await apiClient.post('/api/parking-areas', payload);
      const created = response.data;
      await createSlotsForArea(created.id, created.totalSlots || payload.totalSlots);
      const slots = await fetchSlotsForArea(created.id);
      return mapParkingArea(created, occupancyFromSlots(slots, created.totalSlots));
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 300));

        const trimmedName = (data.name || '').trim();
        const trimmedAddress = (data.address || '').trim();

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
      throwApiError(error);
    }
  },

  updateParkingArea: async (id, data) => {
    try {
      const payload = toParkingAreaPayload(data);
      const response = await apiClient.put(`/api/parking-areas/${id}`, payload);
      const slots = await fetchSlotsForArea(id);
      return mapParkingArea(response.data, occupancyFromSlots(slots, response.data.totalSlots));
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
      throwApiError(error);
    }
  },

  deleteParkingArea: async (id) => {
    try {
      await apiClient.delete(`/api/parking-areas/${id}`);
      return { success: true };
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 300));
        sharedMockRepository.parkingAreas = sharedMockRepository.parkingAreas.filter((p) => p.id !== Number(id));
        delete sharedMockRepository.slots[id];
        return { success: true, message: "Parking area removed successfully." };
      }
      throwApiError(error);
    }
  },

  getSlots: async (parkingAreaId) => {
    try {
      return await fetchSlotsForArea(parkingAreaId);
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 300));
        return sharedMockRepository.slots[parkingAreaId] || [];
      }
      throwApiError(error);
    }
  },

  getAllBookings: async () => {
    try {
      return await fetchAllBookings();
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 300));
        return sharedMockRepository.bookings;
      }
      throwApiError(error);
    }
  },

  processCheckIn: async (bookingCode) => {
    try {
      const response = await apiClient.post('/api/check-in', { bookingCode });
      const data = response.data;
      return {
        ...data,
        status: data.bookingStatus === 'CHECKED_IN' ? 'VALID' : data.bookingStatus,
        message: 'Check-in successful! Gate access granted.'
      };
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

      const message = extractErrorMessage(error);
      const lower = message.toLowerCase();
      let status = 'INVALID';
      if (lower.includes('already been checked in')) {
        status = 'ALREADY_CHECKED_IN';
      } else if (lower.includes('completed')) {
        status = 'COMPLETED';
      } else if (lower.includes('payment')) {
        status = 'UNPAID';
      } else if (error.response?.status === 404) {
        status = 'NOT_FOUND';
      } else if (lower.includes('cancelled')) {
        status = 'CANCELLED';
      }

      if (error.response) {
        return {
          status,
          message,
          bookingCode
        };
      }
      throwApiError(error);
    }
  },

  completeBookingSession: async (bookingId) => {
    try {
      const response = await apiClient.put(`/api/bookings/${bookingId}/complete`);
      return mapBooking(response.data);
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
      throwApiError(error);
    }
  },

  getPredictionReports: async () => {
    return null;
  }
};
