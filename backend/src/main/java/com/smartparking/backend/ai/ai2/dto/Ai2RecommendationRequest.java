package com.smartparking.backend.ai.ai2.dto;

import com.smartparking.backend.vehicle.entity.VehicleType;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Ai2RecommendationRequest {

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    private Double destinationLatitude;
    private Double destinationLongitude;

    @Positive(message = "Radius must be positive")
    private Double radiusMeters;

    private VehicleType vehicleType;
    private String trafficLevel;
    private String weather;
}
