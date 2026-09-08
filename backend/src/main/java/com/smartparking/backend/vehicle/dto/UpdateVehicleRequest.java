package com.smartparking.backend.vehicle.dto;

import com.smartparking.backend.vehicle.entity.VehicleType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateVehicleRequest {

    @NotBlank(message = "Vehicle number is required")
    @Pattern(
            regexp = "^[A-Za-z0-9-]{5,15}$",
            message = "Vehicle number must be 5 to 15 alphanumeric characters and may include hyphens"
    )
    private String vehicleNumber;

    @NotNull(message = "Vehicle type is required")
    private VehicleType vehicleType;
}
