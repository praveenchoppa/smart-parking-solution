package com.smartparking.backend.vehicle.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.smartparking.backend.auth.security.SecurityUtils;
import com.smartparking.backend.vehicle.dto.CreateVehicleRequest;
import com.smartparking.backend.vehicle.dto.UpdateVehicleRequest;
import com.smartparking.backend.vehicle.dto.VehicleResponse;
import com.smartparking.backend.vehicle.service.VehicleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users/{userId}/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    public ResponseEntity<VehicleResponse> createVehicle(
            @PathVariable Long userId,
            @Valid @RequestBody CreateVehicleRequest request) {

        SecurityUtils.requireSelfOrAdmin(userId);
        VehicleResponse response = vehicleService.createVehicle(userId, request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{vehicleId}")
                .buildAndExpand(response.getId())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<VehicleResponse> getVehicleById(
            @PathVariable Long userId,
            @PathVariable Long vehicleId) {
        SecurityUtils.requireSelfOrAdmin(userId);
        return ResponseEntity.ok(vehicleService.getVehicleById(userId, vehicleId));
    }

    @GetMapping
    public ResponseEntity<List<VehicleResponse>> getVehiclesByUserId(@PathVariable Long userId) {
        SecurityUtils.requireSelfOrAdmin(userId);
        return ResponseEntity.ok(vehicleService.getVehiclesByUserId(userId));
    }

    @PutMapping("/{vehicleId}")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable Long userId,
            @PathVariable Long vehicleId,
            @Valid @RequestBody UpdateVehicleRequest request) {
        SecurityUtils.requireSelfOrAdmin(userId);
        return ResponseEntity.ok(vehicleService.updateVehicle(userId, vehicleId, request));
    }

    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<Void> deleteVehicle(
            @PathVariable Long userId,
            @PathVariable Long vehicleId) {
        SecurityUtils.requireSelfOrAdmin(userId);
        vehicleService.deleteVehicle(userId, vehicleId);
        return ResponseEntity.noContent().build();
    }
}
