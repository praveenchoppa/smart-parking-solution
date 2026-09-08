package com.smartparking.backend.parkingarea.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smartparking.backend.common.exception.ResourceNotFoundException;
import com.smartparking.backend.common.util.GeoUtils;
import com.smartparking.backend.parkingarea.dto.CreateParkingAreaRequest;
import com.smartparking.backend.parkingarea.dto.NearbyParkingAreaResponse;
import com.smartparking.backend.parkingarea.dto.ParkingAreaResponse;
import com.smartparking.backend.parkingarea.dto.UpdateParkingAreaRequest;
import com.smartparking.backend.parkingarea.entity.ParkingArea;
import com.smartparking.backend.parkingarea.repository.ParkingAreaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ParkingAreaService {

    private static final double DEFAULT_RADIUS_METERS = 500.0;

    private final ParkingAreaRepository parkingAreaRepository;

    public ParkingAreaResponse createParkingArea(CreateParkingAreaRequest request) {
        ParkingArea parkingArea = ParkingArea.builder()
                .name(request.getName())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .hourlyRate(request.getHourlyRate())
                .totalSlots(request.getTotalSlots())
                .build();

        ParkingArea savedParkingArea = parkingAreaRepository.save(parkingArea);
        return ParkingAreaResponse.fromEntity(savedParkingArea);
    }

    public ParkingAreaResponse getParkingAreaById(Long id) {
        ParkingArea parkingArea = findParkingAreaOrThrow(id);
        return ParkingAreaResponse.fromEntity(parkingArea);
    }

    public List<ParkingAreaResponse> getAllParkingAreas() {
        return parkingAreaRepository.findAll().stream()
                .map(ParkingAreaResponse::fromEntity)
                .toList();
    }

    public List<NearbyParkingAreaResponse> getNearbyParkingAreas(
            double latitude,
            double longitude,
            Double radius) {

        double searchRadius = radius != null ? radius : DEFAULT_RADIUS_METERS;

        return parkingAreaRepository.findAll().stream()
                .map(parkingArea -> {
                    double distance = GeoUtils.calculateDistanceMeters(
                            latitude,
                            longitude,
                            parkingArea.getLatitude(),
                            parkingArea.getLongitude());
                    return new ParkingAreaDistance(parkingArea, distance);
                })
                .filter(entry -> entry.distance() <= searchRadius)
                .sorted(Comparator.comparingDouble(ParkingAreaDistance::distance))
                .map(entry -> NearbyParkingAreaResponse.fromEntity(entry.parkingArea(), entry.distance()))
                .toList();
    }

    public ParkingAreaResponse updateParkingArea(Long id, UpdateParkingAreaRequest request) {
        ParkingArea parkingArea = findParkingAreaOrThrow(id);

        parkingArea.setName(request.getName());
        parkingArea.setAddress(request.getAddress());
        parkingArea.setLatitude(request.getLatitude());
        parkingArea.setLongitude(request.getLongitude());
        parkingArea.setHourlyRate(request.getHourlyRate());
        parkingArea.setTotalSlots(request.getTotalSlots());

        return ParkingAreaResponse.fromEntity(parkingArea);
    }

    public void deleteParkingArea(Long id) {
        if (!parkingAreaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Parking area", "id", id);
        }
        parkingAreaRepository.deleteById(id);
    }

    private ParkingArea findParkingAreaOrThrow(Long id) {
        return parkingAreaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking area", "id", id));
    }

    private record ParkingAreaDistance(ParkingArea parkingArea, double distance) {
    }
}
