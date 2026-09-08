package com.smartparking.backend.checkin.dto;

import java.time.LocalDateTime;

import com.smartparking.backend.booking.entity.Booking;
import com.smartparking.backend.booking.entity.BookingStatus;
import com.smartparking.backend.parkingslot.entity.SlotStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CheckInResponse {

    private final Long bookingId;
    private final String bookingCode;
    private final BookingStatus bookingStatus;
    private final String parkingAreaName;
    private final String slotNumber;
    private final String vehicleNumber;
    private final SlotStatus slotStatus;
    private final LocalDateTime checkedInAt;

    public static CheckInResponse from(Booking booking, SlotStatus slotStatus, LocalDateTime checkedInAt) {
        return CheckInResponse.builder()
                .bookingId(booking.getId())
                .bookingCode(booking.getBookingCode())
                .bookingStatus(booking.getStatus())
                .parkingAreaName(booking.getParkingArea().getName())
                .slotNumber(booking.getParkingSlot().getSlotNumber())
                .vehicleNumber(booking.getVehicle().getVehicleNumber())
                .slotStatus(slotStatus)
                .checkedInAt(checkedInAt)
                .build();
    }
}
