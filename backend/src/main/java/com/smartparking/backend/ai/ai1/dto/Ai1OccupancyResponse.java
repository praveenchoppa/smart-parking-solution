package com.smartparking.backend.ai.ai1.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class Ai1OccupancyResponse {

    private Long parkingAreaId;
    private String name;
    private String timestamp;
    private String source;
    private Integer totalSlots;
    private Integer availableSlots;
    private Integer occupiedSlots;
    private Double occupancyPercentage;
    private List<Ai1DetectedSlotDto> slots;
}
