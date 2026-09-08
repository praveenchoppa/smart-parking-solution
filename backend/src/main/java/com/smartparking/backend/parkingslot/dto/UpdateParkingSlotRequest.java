package com.smartparking.backend.parkingslot.dto;

import com.smartparking.backend.parkingslot.entity.SlotStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateParkingSlotRequest {

    @NotBlank(message = "Slot number is required")
    @Pattern(
            regexp = "^[A-Za-z0-9-]{1,20}$",
            message = "Slot number must be 1 to 20 alphanumeric characters and may include hyphens"
    )
    private String slotNumber;

    @NotNull(message = "Status is required")
    private SlotStatus status;
}
