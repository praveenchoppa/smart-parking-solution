package com.smartparking.backend.checkin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.smartparking.backend.checkin.dto.CheckInRequest;
import com.smartparking.backend.checkin.dto.CheckInResponse;
import com.smartparking.backend.checkin.service.CheckInService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CheckInController {

    private final CheckInService checkInService;

    @PostMapping("/api/check-in")
    public ResponseEntity<CheckInResponse> checkIn(@Valid @RequestBody CheckInRequest request) {
        return ResponseEntity.ok(checkInService.checkIn(request));
    }
}
