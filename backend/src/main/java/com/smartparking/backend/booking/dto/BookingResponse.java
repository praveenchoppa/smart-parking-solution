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
public class BookingResponse {

    private final Long id;
    private final String bookingCode;
    private final Long userId;
    private final Long vehicleId;
    private final String vehicleNumber;
    private final Long parkingAreaId;
    private final String parkingAreaName;
    private final Long parkingSlotId;
    private final String slotNumber;
    private final Integer durationHours;
    private final BigDecimal amount;
    private final BookingStatus status;
    private final PaymentStatus paymentStatus;
    private final LocalDateTime paidAt;
    private final LocalDateTime completedAt;
    private final LocalDateTime createdAt;

    public static BookingResponse fromEntity(Booking booking) {
        return fromEntity(booking, null);
    }

    public static BookingResponse fromEntity(Booking booking, Payment payment) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .userId(booking.getUser().getId())
                .vehicleId(booking.getVehicle().getId())
                .vehicleNumber(booking.getVehicle().getVehicleNumber())
                .parkingAreaId(booking.getParkingArea().getId())
                .parkingAreaName(booking.getParkingArea().getName())
                .parkingSlotId(booking.getParkingSlot().getId())
                .slotNumber(booking.getParkingSlot().getSlotNumber())
                .durationHours(booking.getDurationHours())
                .amount(booking.getAmount())
                .status(booking.getStatus())
                .paymentStatus(payment != null ? payment.getStatus() : null)
                .paidAt(payment != null ? payment.getPaidAt() : null)
                .completedAt(booking.getCompletedAt())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
