package com.smartparking.backend.parkingarea.dto;

import com.smartparking.backend.parkingarea.entity.ParkingArea;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NearbyParkingAreaResponse {

    private final Long id;
    private final String name;
    private final String address;
    private final Double latitude;
    private final Double longitude;
    private final Double hourlyRate;
    private final Integer totalSlots;
    private final Double distanceMeters;

    public static NearbyParkingAreaResponse fromEntity(ParkingArea parkingArea, double distanceMeters) {
        return NearbyParkingAreaResponse.builder()
                .id(parkingArea.getId())
                .name(parkingArea.getName())
                .address(parkingArea.getAddress())
                .latitude(parkingArea.getLatitude())
                .longitude(parkingArea.getLongitude())
                .hourlyRate(parkingArea.getHourlyRate())
                .totalSlots(parkingArea.getTotalSlots())
                .distanceMeters(Math.round(distanceMeters * 100.0) / 100.0)
                .build();
    }
}
