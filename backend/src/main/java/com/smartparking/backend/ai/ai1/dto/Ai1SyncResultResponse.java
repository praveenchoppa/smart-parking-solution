package com.smartparking.backend.ai.ai1.dto;

import java.util.List;

import com.smartparking.backend.parkingslot.dto.ParkingSlotResponse;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class Ai1SyncResultResponse {

    private final Long parkingAreaId;
    private final String ai1Timestamp;
    private final String ai1Source;
    private final int totalAiDetections;
    private final int updatedSlots;
    private final int unchangedSlots;
    private final int unmatchedAiSlots;
    private final List<String> unmatchedAiSlotNumbers;
    private final List<ParkingSlotResponse> slots;
}
