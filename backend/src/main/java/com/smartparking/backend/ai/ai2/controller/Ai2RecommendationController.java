package com.smartparking.backend.ai.ai2.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartparking.backend.ai.ai2.dto.Ai2RecommendationRequest;
import com.smartparking.backend.ai.ai2.dto.Ai2RecommendationResponse;
import com.smartparking.backend.ai.ai2.service.Ai2RecommendationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ai/ai2")
@RequiredArgsConstructor
public class Ai2RecommendationController {

    private final Ai2RecommendationService ai2RecommendationService;

    @PostMapping("/recommend")
    public ResponseEntity<Ai2RecommendationResponse> recommend(
            @Valid @RequestBody Ai2RecommendationRequest request) {
        return ResponseEntity.ok(ai2RecommendationService.recommend(request));
    }
}
