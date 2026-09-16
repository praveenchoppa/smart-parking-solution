import { apiClient, ENABLE_MOCK, throwApiError } from './apiClient';
import { bookingApi } from './bookingApi';

export const paymentApi = {
  processPayment: async (bookingId) => {
    try {
      const response = await apiClient.post('/api/payments', {
        bookingId: Number(bookingId)
      });
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 800));
        const booking = await bookingApi.getBookingDetails(bookingId);
        if (booking) {
          booking.status = "PENDING_CHECK_IN";
          booking.paymentStatus = "PAID";
          booking.qrData = booking.bookingCode;
        }
        return {
          id: Date.now(),
          bookingId: Number(bookingId),
          paymentMode: "SIMULATED",
          status: "SUCCESS",
          paidAt: new Date().toISOString()
        };
      }
      throwApiError(error);
    }
  }
};
