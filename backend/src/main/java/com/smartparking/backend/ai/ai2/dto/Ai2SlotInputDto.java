package com.smartparking.backend.ai.ai2.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class Ai2SlotInputDto {

    @JsonProperty("slot_id")
    private final String slotId;

    private final String zone;

    @JsonProperty("slot_type")
    private final String slotType;

    @JsonProperty("distance_m")
    private final double distanceM;

    @JsonProperty("walking_time_min")
    private final double walkingTimeMin;

    @JsonProperty("parking_fee")
    private final double parkingFee;

    private final int occupancy;

    private final int availability;

    @JsonProperty("distance_destination_m")
    private final double distanceDestinationM;

    @JsonProperty("traffic_level")
    private final String trafficLevel;

    private final String weather;

    @JsonProperty("ev_charging")
    private final int evCharging;

    private final int reserved;
}
