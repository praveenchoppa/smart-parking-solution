package com.smartparking.backend.ai.ai2.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class Ai2RecommendationItemDto {

    @JsonProperty("slot_id")
    private String slotId;

    @JsonProperty("distance_m")
    private Double distanceM;

    @JsonProperty("walking_time_min")
    private Double walkingTimeMin;

    @JsonProperty("parking_fee")
    private Double parkingFee;

    private Double occupancy;

    private Double score;
}
