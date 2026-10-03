package com.smartparking.backend.ai.ai3.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Ai3PredictionResponse {

    @JsonProperty("predicted_occupancy")
    private Double predictedOccupancy;

    @JsonProperty("predicted_occupied_slots")
    private Integer predictedOccupiedSlots;

    @JsonProperty("available_slots")
    private Integer availableSlots;
}
