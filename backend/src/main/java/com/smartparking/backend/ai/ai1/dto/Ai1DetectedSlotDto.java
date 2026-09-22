package com.smartparking.backend.ai.ai1.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class Ai1DetectedSlotDto {

    private Integer slotId;
    private String slotNumber;
    private String status;
}
