import { apiClient, shouldUseMock, throwApiError } from './apiClient';
import { bookingApi } from './bookingApi';

export const paymentApi = {
  processPayment: async (bookingId) => {
    try {
      const response = await apiClient.post(`/api/bookings/${bookingId}/payment`);
      const data = response.data;
      return {
        ...data,
        success: data.status === 'SUCCESS'
      };
    } catch (error) {
      if (shouldUseMock(error)) {
        await new Promise((res) => setTimeout(res, 800));
        const booking = await bookingApi.getBookingDetails(bookingId);
        if (booking) {
          booking.status = 'PENDING_CHECK_IN';
          booking.paymentStatus = 'PAID';
          booking.qrData = booking.bookingCode;
        }
        return {
          success: true,
          status: 'SUCCESS',
          paymentStatus: 'PAID',
          bookingId: Number(bookingId),
          transactionId: `TXN-${Date.now()}`,
          message: 'Payment processed successfully.'
        };
      }
      throwApiError(error);
    }
  }
};
