import { apiClient, ENABLE_MOCK } from './apiClient';
import { bookingApi } from './bookingApi';

export const paymentApi = {
  processPayment: async (bookingId, paymentDetails = {}) => {
    try {
      const response = await apiClient.post(`/api/bookings/${bookingId}/payment`, paymentDetails);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK) {
        await new Promise((res) => setTimeout(res, 800));
        // Update booking status in mock repository
        const booking = await bookingApi.getBookingDetails(bookingId);
        if (booking) {
          booking.status = "PENDING_CHECK_IN";
          booking.paymentStatus = "PAID";
          booking.qrData = booking.bookingCode;
        }
        return {
          success: true,
          status: "PENDING_CHECK_IN",
          paymentStatus: "PAID",
          bookingId: Number(bookingId),
          transactionId: `TXN-${Date.now()}`,
          message: "Payment processed successfully."
        };
      }
      throw error;
    }
  }
};
