package com.smartparking.backend.ai.ai2.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class Ai2RecommendationResponse {

    private final boolean recommendationAvailable;
    private final Long recommendedParkingAreaId;
    private final Long recommendedParkingSlotId;
    private final String recommendedSlotNumber;
    private final String recommendedParkingAreaName;
    private final Double score;
    private final String reason;
    private final String message;
    private final List<Ai2RecommendationItemDto> topRecommendations;

    public static Ai2RecommendationResponse unavailable(String message) {
        return Ai2RecommendationResponse.builder()
                .recommendationAvailable(false)
                .message(message)
                .build();
    }

    public static Ai2RecommendationResponse noSlotsAvailable() {
        return unavailable("No available parking slots found for recommendation.");
    }
}
