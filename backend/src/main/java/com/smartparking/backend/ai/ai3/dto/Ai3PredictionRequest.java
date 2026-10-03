package com.smartparking.backend.ai.ai3.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ai3PredictionRequest {

    @NotNull(message = "Date is required (YYYY-MM-DD)")
    private String date;

    @NotNull(message = "Time is required (HH:MM)")
    private String time;

    @NotNull(message = "Parking area ID is required (e.g. A01)")
    private String parkingAreaId;

    @NotNull(message = "Total slots count is required")
    private Integer totalSlots;

    @NotNull(message = "Previous occupancy percentage is required")
    private Double previousOccupancy;

    @NotNull(message = "Current occupancy percentage is required")
    private Double currentOccupancy;
}
