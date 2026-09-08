package com.smartparking.backend.parkingslot.dto;

import com.smartparking.backend.parkingslot.entity.ParkingSlot;
import com.smartparking.backend.parkingslot.entity.SlotStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ParkingSlotResponse {

    private final Long id;
    private final Long parkingAreaId;
    private final String slotNumber;
    private final SlotStatus status;

    public static ParkingSlotResponse fromEntity(ParkingSlot parkingSlot) {
        return ParkingSlotResponse.builder()
                .id(parkingSlot.getId())
                .parkingAreaId(parkingSlot.getParkingArea().getId())
                .slotNumber(parkingSlot.getSlotNumber())
                .status(parkingSlot.getStatus())
                .build();
    }
}
