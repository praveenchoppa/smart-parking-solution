package com.smartparking.backend.ai.ai3.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartparking.backend.ai.ai3.dto.Ai3PredictionRequest;
import com.smartparking.backend.ai.ai3.dto.Ai3PredictionResponse;
import com.smartparking.backend.ai.ai3.service.Ai3PredictionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ai/ai3")
@RequiredArgsConstructor
public class Ai3PredictionController {

    private final Ai3PredictionService ai3PredictionService;

    @GetMapping("/parking-areas/{parkingAreaId}/predict")
    public ResponseEntity<Ai3PredictionResponse> predictForArea(@PathVariable Long parkingAreaId) {
        return ResponseEntity.ok(ai3PredictionService.predictForParkingArea(parkingAreaId));
    }

    @PostMapping("/predict")
    public ResponseEntity<Ai3PredictionResponse> predictCustom(@Valid @RequestBody Ai3PredictionRequest request) {
        return ResponseEntity.ok(ai3PredictionService.predictCustom(request));
    }
}
