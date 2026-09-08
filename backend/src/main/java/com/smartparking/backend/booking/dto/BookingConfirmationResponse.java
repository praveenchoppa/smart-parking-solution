package com.smartparking.backend.booking.dto;

import java.math.BigDecimal;

import com.smartparking.backend.booking.entity.Booking;
import com.smartparking.backend.booking.entity.BookingStatus;
import com.smartparking.backend.payment.entity.Payment;
import com.smartparking.backend.payment.entity.PaymentStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BookingConfirmationResponse {

    private final Long bookingId;
    private final String bookingCode;
    private final String qrCodeValue;
    private final Long parkingAreaId;
    private final String parkingAreaName;
    private final String slotNumber;
    private final String vehicleNumber;
    private final Integer durationHours;
    private final BigDecimal amount;
    private final PaymentStatus paymentStatus;
    private final BookingStatus bookingStatus;

    public static BookingConfirmationResponse from(Booking booking, Payment payment) {
        return BookingConfirmationResponse.builder()
                .bookingId(booking.getId())
                .bookingCode(booking.getBookingCode())
                .qrCodeValue(booking.getBookingCode())
                .parkingAreaId(booking.getParkingArea().getId())
                .parkingAreaName(booking.getParkingArea().getName())
                .slotNumber(booking.getParkingSlot().getSlotNumber())
                .vehicleNumber(booking.getVehicle().getVehicleNumber())
                .durationHours(booking.getDurationHours())
                .amount(booking.getAmount())
                .paymentStatus(payment != null ? payment.getStatus() : null)
                .bookingStatus(booking.getStatus())
                .build();
    }
}
