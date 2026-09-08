package com.smartparking.backend.vehicle.dto;

import com.smartparking.backend.vehicle.entity.Vehicle;
import com.smartparking.backend.vehicle.entity.VehicleType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VehicleResponse {

    private final Long id;
    private final Long userId;
    private final String vehicleNumber;
    private final VehicleType vehicleType;

    public static VehicleResponse fromEntity(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .userId(vehicle.getUser().getId())
                .vehicleNumber(vehicle.getVehicleNumber())
                .vehicleType(vehicle.getVehicleType())
                .build();
    }
}
