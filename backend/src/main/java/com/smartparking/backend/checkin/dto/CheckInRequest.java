package com.smartparking.backend.checkin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckInRequest {

    @NotBlank(message = "Booking code is required")
    private String bookingCode;
}
