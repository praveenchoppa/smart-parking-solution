package com.smartparking.backend.ai.ai2.service;

import com.smartparking.backend.ai.ai2.dto.Ai2SlotInputDto;
import com.smartparking.backend.parkingarea.dto.NearbyParkingAreaResponse;
import com.smartparking.backend.parkingslot.entity.ParkingSlot;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
class Ai2SlotContext {

    private final NearbyParkingAreaResponse area;
    private final ParkingSlot slot;
    private final Ai2SlotInputDto input;
}
