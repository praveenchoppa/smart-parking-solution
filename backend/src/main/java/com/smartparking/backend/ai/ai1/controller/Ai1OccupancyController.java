package com.smartparking.backend.ai.ai1.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartparking.backend.ai.ai1.dto.Ai1AreaInfoDto;
import com.smartparking.backend.ai.ai1.dto.Ai1OccupancyResponse;
import com.smartparking.backend.ai.ai1.dto.Ai1SyncResultResponse;
import com.smartparking.backend.ai.ai1.service.Ai1OccupancyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ai/ai1")
@RequiredArgsConstructor
public class Ai1OccupancyController {

    private final Ai1OccupancyService ai1OccupancyService;

    @GetMapping("/areas")
    public ResponseEntity<List<Ai1AreaInfoDto>> getAi1Areas() {
        return ResponseEntity.ok(ai1OccupancyService.getAi1Areas());
    }

    @GetMapping("/parking-areas/{parkingAreaId}/occupancy")
    public ResponseEntity<Ai1OccupancyResponse> getAi1Occupancy(@PathVariable Long parkingAreaId) {
        return ResponseEntity.ok(ai1OccupancyService.getAi1Occupancy(parkingAreaId));
    }

    @PostMapping("/parking-areas/{parkingAreaId}/sync")
    public ResponseEntity<Ai1SyncResultResponse> syncParkingAreaOccupancy(@PathVariable Long parkingAreaId) {
        return ResponseEntity.ok(ai1OccupancyService.syncParkingAreaOccupancy(parkingAreaId));
    }
}
