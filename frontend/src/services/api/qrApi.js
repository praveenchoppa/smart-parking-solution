import { apiClient, ENABLE_MOCK } from './apiClient';

export const qrApi = {
  getBookingPassQR: async (bookingId) => {
    try {
      const response = await apiClient.get(`/api/bookings/${bookingId}/qr`);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 300));
        return {
          bookingId: Number(bookingId),
          bookingCode: `BK${bookingId}-PASS`,
          qrData: `BK${bookingId}-PASS`,
          status: "PENDING_CHECK_IN"
        };
      }
      throw error;
    }
  }
};
