import { apiClient, ENABLE_MOCK, throwApiError, getCurrentUserId } from './apiClient';
import { INITIAL_MOCK_BOOKINGS, INITIAL_MOCK_PARKING_AREAS, INITIAL_MOCK_SLOTS, INITIAL_MOCK_VEHICLES } from '../mock/mockData';

let mockBookings = [...INITIAL_MOCK_BOOKINGS];

const ACTIVE_BOOKING_STATUSES = ['PENDING_CHECK_IN', 'CHECKED_IN'];

function mapPaymentStatus(paymentStatus) {
  if (paymentStatus === 'SUCCESS') return 'PAID';
  if (paymentStatus === 'PENDING') return 'UNPAID';
  return paymentStatus;
}

export function mapBooking(booking) {
  if (!booking) return booking;
  const amount = booking.amount ?? booking.totalAmount;
  const durationHours = booking.durationHours;
  const hourlyRate =
    booking.hourlyRate ??
    (amount != null && durationHours ? Number(amount) / Number(durationHours) : undefined);

  return {
    ...booking,
    id: booking.id ?? booking.bookingId,
    totalAmount: amount,
    hourlyRate,
    completedTime: booking.completedAt ?? booking.completedTime,
    paymentStatus: mapPaymentStatus(booking.paymentStatus),
    qrData: booking.qrCodeValue || booking.qrData || booking.bookingCode,
    status: booking.status || booking.bookingStatus
  };
}

export function mapConfirmation(confirmation) {
  if (!confirmation) return confirmation;
  return mapBooking({
    ...confirmation,
    id: confirmation.bookingId,
    status: confirmation.bookingStatus,
    qrData: confirmation.qrCodeValue || confirmation.bookingCode
  });
}

export const bookingApi = {
  createBooking: async (bookingData) => {
    try {
      const payload = {
        userId: getCurrentUserId(),
        vehicleId: Number(bookingData.vehicleId),
        parkingAreaId: Number(bookingData.parkingAreaId),
        parkingSlotId: Number(bookingData.parkingSlotId ?? bookingData.slotId),
        durationHours: Number(bookingData.durationHours)
      };
      const response = await apiClient.post('/api/bookings', payload);
      return mapBooking(response.data);
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 600));

        const parking = INITIAL_MOCK_PARKING_AREAS.find((p) => p.id === Number(bookingData.parkingAreaId)) || INITIAL_MOCK_PARKING_AREAS[0];
        const slots = INITIAL_MOCK_SLOTS[bookingData.parkingAreaId] || [];
        const slot = slots.find((s) => s.slotId === Number(bookingData.parkingSlotId)) || { slotNumber: "A-01", status: "AVAILABLE" };
        const vehicle = INITIAL_MOCK_VEHICLES.find((v) => v.id === Number(bookingData.vehicleId)) || INITIAL_MOCK_VEHICLES[0];

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
      throwApiError(error);
    }
  },

  getBookingDetails: async (id) => {
    try {
      const response = await apiClient.get(`/api/bookings/${id}`);
      return mapBooking(response.data);
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 400));
        const booking = mockBookings.find((b) => b.id === Number(id));
        if (!booking) throw new Error("Booking not found.");
        return booking;
      }
      throwApiError(error);
    }
  },

  getBookingConfirmation: async (id) => {
    try {
      const response = await apiClient.get(`/api/bookings/${id}/confirmation`);
      return mapConfirmation(response.data);
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 300));
        const booking = mockBookings.find((b) => b.id === Number(id));
        if (!booking) throw new Error("Booking not found.");
        return {
          ...booking,
          qrData: booking.bookingCode
        };
      }
      throwApiError(error);
    }
  },

  getCurrentBooking: async () => {
    try {
      const userId = getCurrentUserId();
      const response = await apiClient.get(`/api/users/${userId}/bookings`);
      const bookings = (response.data || []).map(mapBooking);
      return bookings.find((b) => ACTIVE_BOOKING_STATUSES.includes(b.status)) || null;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 400));
        const active = mockBookings.find((b) => b.status === "PENDING_CHECK_IN" || b.status === "CHECKED_IN");
        return active || null;
      }
      throwApiError(error);
    }
  },

  getUserBookingHistory: async () => {
    try {
      const userId = getCurrentUserId();
      const response = await apiClient.get(`/api/users/${userId}/bookings`);
      return (response.data || []).map(mapBooking);
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 450));
        return mockBookings;
      }
      throwApiError(error);
    }
  },

  completeBooking: async (id) => {
    try {
      const response = await apiClient.put(`/api/bookings/${id}/complete`);
      return mapBooking(response.data);
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 400));
        const booking = mockBookings.find((b) => b.id === Number(id));
        if (booking) {
          booking.status = "COMPLETED";
          booking.completedTime = new Date().toISOString();
        }
        return booking;
      }
      throwApiError(error);
    }
  }
};
