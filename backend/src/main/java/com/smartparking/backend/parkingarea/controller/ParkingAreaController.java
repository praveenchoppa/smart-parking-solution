package com.smartparking.backend.parkingarea.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.smartparking.backend.parkingarea.dto.CreateParkingAreaRequest;
import com.smartparking.backend.parkingarea.dto.NearbyParkingAreaResponse;
import com.smartparking.backend.parkingarea.dto.ParkingAreaResponse;
import com.smartparking.backend.parkingarea.dto.UpdateParkingAreaRequest;
import com.smartparking.backend.parkingarea.service.ParkingAreaService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/parking-areas")
@RequiredArgsConstructor
@Validated
public class ParkingAreaController {

    private final ParkingAreaService parkingAreaService;

    @PostMapping
    public ResponseEntity<ParkingAreaResponse> createParkingArea(
            @Valid @RequestBody CreateParkingAreaRequest request) {

        ParkingAreaResponse response = parkingAreaService.createParkingArea(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.getId())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<NearbyParkingAreaResponse>> getNearbyParkingAreas(
            @RequestParam @NotNull(message = "Latitude is required")
            @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
            @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
            Double latitude,
            @RequestParam @NotNull(message = "Longitude is required")
            @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
            @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
            Double longitude,
            @RequestParam(required = false)
            @Positive(message = "Radius must be positive")
            Double radius) {

        return ResponseEntity.ok(
                parkingAreaService.getNearbyParkingAreas(latitude, longitude, radius));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParkingAreaResponse> getParkingAreaById(@PathVariable Long id) {
        return ResponseEntity.ok(parkingAreaService.getParkingAreaById(id));
    }

    @GetMapping
    public ResponseEntity<List<ParkingAreaResponse>> getAllParkingAreas() {
        return ResponseEntity.ok(parkingAreaService.getAllParkingAreas());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParkingAreaResponse> updateParkingArea(
            @PathVariable Long id,
            @Valid @RequestBody UpdateParkingAreaRequest request) {
        return ResponseEntity.ok(parkingAreaService.updateParkingArea(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParkingArea(@PathVariable Long id) {
        parkingAreaService.deleteParkingArea(id);
        return ResponseEntity.noContent().build();
    }
}
