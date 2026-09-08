package com.smartparking.backend.booking.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.smartparking.backend.booking.entity.Booking;
import com.smartparking.backend.booking.entity.BookingStatus;
import com.smartparking.backend.payment.entity.Payment;
import com.smartparking.backend.payment.entity.PaymentStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BookingReceiptResponse {

    private final Long bookingId;
    private final String bookingCode;
    private final String parkingAreaName;
    private final String slotNumber;
    private final String vehicleNumber;
    private final Integer durationHours;
    private final BigDecimal amount;
    private final PaymentStatus paymentStatus;
    private final BookingStatus bookingStatus;
    private final LocalDateTime paidAt;
    private final LocalDateTime completedAt;

    public static BookingReceiptResponse from(Booking booking, Payment payment) {
        return BookingReceiptResponse.builder()
                .bookingId(booking.getId())
                .bookingCode(booking.getBookingCode())
                .parkingAreaName(booking.getParkingArea().getName())
                .slotNumber(booking.getParkingSlot().getSlotNumber())
                .vehicleNumber(booking.getVehicle().getVehicleNumber())
                .durationHours(booking.getDurationHours())
                .amount(booking.getAmount())
                .paymentStatus(payment.getStatus())
                .bookingStatus(booking.getStatus())
                .paidAt(payment.getPaidAt())
                .completedAt(booking.getCompletedAt())
                .build();
    }
}
