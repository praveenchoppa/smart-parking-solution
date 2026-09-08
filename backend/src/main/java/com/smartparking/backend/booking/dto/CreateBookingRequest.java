package com.smartparking.backend.booking.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateBookingRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Parking area ID is required")
    private Long parkingAreaId;

    @NotNull(message = "Parking slot ID is required")
    private Long parkingSlotId;

    @NotNull(message = "Duration hours is required")
    @Positive(message = "Duration hours must be positive")
    private Integer durationHours;
}
