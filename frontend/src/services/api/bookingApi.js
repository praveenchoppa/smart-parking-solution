import { apiClient, ENABLE_MOCK } from './apiClient';
import { INITIAL_MOCK_BOOKINGS, INITIAL_MOCK_PARKING_AREAS, INITIAL_MOCK_SLOTS, INITIAL_MOCK_VEHICLES } from '../mock/mockData';

let mockBookings = [...INITIAL_MOCK_BOOKINGS];

export const bookingApi = {
  createBooking: async (bookingData) => {
    // Body: { parkingAreaId, parkingSlotId, vehicleId, durationHours }
    try {
      const response = await apiClient.post('/api/bookings', bookingData);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 600));

        // Find metadata
        const parking = INITIAL_MOCK_PARKING_AREAS.find((p) => p.id === Number(bookingData.parkingAreaId)) || INITIAL_MOCK_PARKING_AREAS[0];
        const slots = INITIAL_MOCK_SLOTS[bookingData.parkingAreaId] || [];
        const slot = slots.find((s) => s.slotId === Number(bookingData.parkingSlotId)) || { slotNumber: "A-01", status: "AVAILABLE" };
        const vehicle = INITIAL_MOCK_VEHICLES.find((v) => v.id === Number(bookingData.vehicleId)) || INITIAL_MOCK_VEHICLES[0];

        // Simulate rare 409 conflict test if slotId is 104 or OCCUPIED
        if (slot.status === "OCCUPIED" || slot.status === "RESERVED") {
          const err = new Error("This slot was just booked by another user. Please select another slot.");
          err.response = { status: 409, data: { message: err.message } };
          throw err;
        }

        const duration = Number(bookingData.durationHours) || 1;
        const totalAmount = parking.hourlyRate * duration;
        const newBookingId = 100 + mockBookings.length + 1;
        const bookingCode = `BK${newBookingId}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        const newBooking = {
          id: newBookingId,
          bookingCode,
          parkingAreaId: parking.id,
          parkingAreaName: parking.name,
          parkingAddress: parking.address,
          parkingSlotId: Number(bookingData.parkingSlotId),
          slotNumber: slot.slotNumber || "A-01",
          vehicleId: Number(bookingData.vehicleId),
          vehicleNumber: vehicle.vehicleNumber,
          vehicleType: vehicle.vehicleType,
          durationHours: duration,
          hourlyRate: parking.hourlyRate,
          totalAmount: totalAmount,
          status: "PENDING_PAYMENT",
          paymentStatus: "UNPAID",
          createdAt: new Date().toISOString(),
          checkInTime: null,
          completedTime: null
        };

        mockBookings.unshift(newBooking);
        return newBooking;
      }
      throw error;
    }
  },

  getBookingDetails: async (id) => {
    try {
      const response = await apiClient.get(`/api/bookings/${id}`);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 400));
        const booking = mockBookings.find((b) => b.id === Number(id));
        if (!booking) throw new Error("Booking not found.");
        return booking;
      }
      throw error;
    }
  },

  getCurrentBooking: async () => {
    try {
      const response = await apiClient.get('/api/bookings/current');
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 400));
        // Return active booking (PENDING_CHECK_IN or CHECKED_IN)
        const active = mockBookings.find((b) => b.status === "PENDING_CHECK_IN" || b.status === "CHECKED_IN");
        return active || null;
      }
      throw error;
    }
  },

  getUserBookingHistory: async () => {
    try {
      const response = await apiClient.get('/api/bookings/history');
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 450));
        return mockBookings;
      }
      throw error;
    }
  }
};
