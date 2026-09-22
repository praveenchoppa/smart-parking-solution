package com.smartparking.backend.ai.ai2.service;

import java.util.Locale;

import org.springframework.stereotype.Component;

import com.smartparking.backend.ai.ai2.dto.Ai2SlotInputDto;
import com.smartparking.backend.parkingarea.dto.NearbyParkingAreaResponse;
import com.smartparking.backend.parkingslot.entity.ParkingSlot;
import com.smartparking.backend.parkingslot.entity.SlotStatus;
import com.smartparking.backend.vehicle.entity.VehicleType;

@Component
public class Ai2SlotFeatureMapper {

    private static final double DEFAULT_RADIUS_METERS = 500.0;
    private static final double WALKING_SPEED_METERS_PER_MINUTE = 80.0;

    public Ai2SlotInputDto toAi2Input(
            NearbyParkingAreaResponse area,
            ParkingSlot slot,
            int areaOccupancyPercent,
            double destinationLatitude,
            double destinationLongitude,
            String trafficLevel,
            String weather,
            VehicleType vehicleType) {

        double distanceM = area.getDistanceMeters() != null ? area.getDistanceMeters() : 0.0;
        double destinationDistanceM = distanceM;

        boolean isAvailable = slot.getStatus() == SlotStatus.AVAILABLE;

        return Ai2SlotInputDto.builder()
                .slotId(formatSlotId(slot))
                .zone(mapZone(area.getId()))
                .slotType(mapSlotType(vehicleType))
                .distanceM(distanceM)
                .walkingTimeMin(calculateWalkingTimeMinutes(distanceM))
                .parkingFee(area.getHourlyRate() != null ? area.getHourlyRate() : 0.0)
                .occupancy(areaOccupancyPercent)
                .availability(isAvailable ? 1 : 0)
                .distanceDestinationM(destinationDistanceM)
                .trafficLevel(normalizeTrafficLevel(trafficLevel))
                .weather(normalizeWeather(weather))
                .evCharging(0)
                .reserved(slot.getStatus() == SlotStatus.RESERVED ? 1 : 0)
                .build();
    }

    public double resolveRadius(Double radiusMeters) {
        return radiusMeters != null && radiusMeters > 0 ? radiusMeters : DEFAULT_RADIUS_METERS;
    }

    public String normalizeSlotKey(String slotIdOrNumber) {
        if (slotIdOrNumber == null) {
            return "";
        }
        return slotIdOrNumber.replace("-", "")
                .replace(" ", "")
                .toUpperCase(Locale.ROOT);
    }

    private String formatSlotId(ParkingSlot slot) {
        String slotNumber = slot.getSlotNumber();
        if (slotNumber != null && !slotNumber.isBlank()) {
            return normalizeSlotKey(slotNumber);
        }
        return "S" + String.format("%03d", slot.getId());
    }

    private String mapZone(Long parkingAreaId) {
        if (parkingAreaId == null) {
            return "A";
        }
        int index = (int) ((parkingAreaId - 1) % 3);
        return String.valueOf((char) ('A' + index));
    }

    private String mapSlotType(VehicleType vehicleType) {
        if (vehicleType == null) {
            return "Standard";
        }
        return switch (vehicleType) {
            case SUV -> "Large";
            case BIKE -> "Compact";
            case CAR -> "Standard";
        };
    }

    private double calculateWalkingTimeMinutes(double distanceMeters) {
        if (distanceMeters <= 0) {
            return 0.0;
        }
        return Math.round((distanceMeters / WALKING_SPEED_METERS_PER_MINUTE) * 100.0) / 100.0;
    }

    private String normalizeTrafficLevel(String trafficLevel) {
        if (trafficLevel == null || trafficLevel.isBlank()) {
            return "Medium";
        }
        String normalized = trafficLevel.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "low" -> "Low";
            case "high" -> "High";
            default -> "Medium";
        };
    }

    private String normalizeWeather(String weather) {
        if (weather == null || weather.isBlank()) {
            return "Clear";
        }
        String normalized = weather.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "rain", "rainy" -> "Rain";
            case "cloudy", "cloud" -> "Cloudy";
            default -> "Clear";
        };
    }
}
