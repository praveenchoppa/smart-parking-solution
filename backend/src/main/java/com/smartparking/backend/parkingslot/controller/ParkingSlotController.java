package com.smartparking.backend.parkingslot.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.smartparking.backend.parkingslot.dto.CreateParkingSlotRequest;
import com.smartparking.backend.parkingslot.dto.ParkingSlotResponse;
import com.smartparking.backend.parkingslot.dto.UpdateParkingSlotRequest;
import com.smartparking.backend.parkingslot.service.ParkingSlotService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ParkingSlotController {

    private final ParkingSlotService parkingSlotService;

    @PostMapping("/api/parking-areas/{parkingAreaId}/slots")
    public ResponseEntity<ParkingSlotResponse> createParkingSlot(
            @PathVariable Long parkingAreaId,
            @Valid @RequestBody CreateParkingSlotRequest request) {

        ParkingSlotResponse response = parkingSlotService.createParkingSlot(parkingAreaId, request);

        URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/parking-slots/{id}")
                .buildAndExpand(response.getId())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/api/parking-areas/{parkingAreaId}/slots")
    public ResponseEntity<List<ParkingSlotResponse>> getParkingSlotsByParkingAreaId(
            @PathVariable Long parkingAreaId) {
        return ResponseEntity.ok(parkingSlotService.getParkingSlotsByParkingAreaId(parkingAreaId));
    }

    @GetMapping("/api/parking-slots/{id}")
    public ResponseEntity<ParkingSlotResponse> getParkingSlotById(@PathVariable Long id) {
        return ResponseEntity.ok(parkingSlotService.getParkingSlotById(id));
    }

    @PutMapping("/api/parking-slots/{id}")
    public ResponseEntity<ParkingSlotResponse> updateParkingSlot(
            @PathVariable Long id,
            @Valid @RequestBody UpdateParkingSlotRequest request) {
        return ResponseEntity.ok(parkingSlotService.updateParkingSlot(id, request));
    }

    @DeleteMapping("/api/parking-slots/{id}")
    public ResponseEntity<Void> deleteParkingSlot(@PathVariable Long id) {
        parkingSlotService.deleteParkingSlot(id);
        return ResponseEntity.noContent().build();
    }
}
