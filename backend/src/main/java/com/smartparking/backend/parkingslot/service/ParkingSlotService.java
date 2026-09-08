package com.smartparking.backend.parkingslot.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.smartparking.backend.common.exception.DuplicateResourceException;
import com.smartparking.backend.common.exception.ResourceNotFoundException;
import com.smartparking.backend.parkingarea.entity.ParkingArea;
import com.smartparking.backend.parkingarea.repository.ParkingAreaRepository;
import com.smartparking.backend.parkingslot.dto.CreateParkingSlotRequest;
import com.smartparking.backend.parkingslot.dto.ParkingSlotResponse;
import com.smartparking.backend.parkingslot.dto.UpdateParkingSlotRequest;
import com.smartparking.backend.parkingslot.entity.ParkingSlot;
import com.smartparking.backend.parkingslot.entity.SlotStatus;
import com.smartparking.backend.parkingslot.repository.ParkingSlotRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ParkingSlotService {

    private final ParkingSlotRepository parkingSlotRepository;
    private final ParkingAreaRepository parkingAreaRepository;

    public ParkingSlotResponse createParkingSlot(Long parkingAreaId, CreateParkingSlotRequest request) {
        ParkingArea parkingArea = findParkingAreaOrThrow(parkingAreaId);

        if (parkingSlotRepository.existsByParkingAreaIdAndSlotNumber(parkingAreaId, request.getSlotNumber())) {
            throw new DuplicateResourceException(
                    "Parking slot",
                    "slotNumber",
                    request.getSlotNumber());
        }

        SlotStatus status = request.getStatus() != null ? request.getStatus() : SlotStatus.AVAILABLE;

        ParkingSlot parkingSlot = ParkingSlot.builder()
                .parkingArea(parkingArea)
                .slotNumber(request.getSlotNumber().toUpperCase())
                .status(status)
                .build();

        ParkingSlot savedParkingSlot = parkingSlotRepository.save(parkingSlot);
        return ParkingSlotResponse.fromEntity(savedParkingSlot);
    }

    public ParkingSlotResponse getParkingSlotById(Long id) {
        ParkingSlot parkingSlot = findParkingSlotOrThrow(id);
        return ParkingSlotResponse.fromEntity(parkingSlot);
    }

    public List<ParkingSlotResponse> getParkingSlotsByParkingAreaId(Long parkingAreaId) {
        findParkingAreaOrThrow(parkingAreaId);
        return parkingSlotRepository.findByParkingAreaId(parkingAreaId).stream()
                .map(ParkingSlotResponse::fromEntity)
                .toList();
    }

    public ParkingSlotResponse updateParkingSlot(Long id, UpdateParkingSlotRequest request) {
        ParkingSlot parkingSlot = findParkingSlotOrThrow(id);
        Long parkingAreaId = parkingSlot.getParkingArea().getId();

        if (parkingSlotRepository.existsByParkingAreaIdAndSlotNumberAndIdNot(
                parkingAreaId,
                request.getSlotNumber(),
                id)) {
            throw new DuplicateResourceException(
                    "Parking slot",
                    "slotNumber",
                    request.getSlotNumber());
        }

        parkingSlot.setSlotNumber(request.getSlotNumber().toUpperCase());
        parkingSlot.setStatus(request.getStatus());

        return ParkingSlotResponse.fromEntity(parkingSlot);
    }

    public void deleteParkingSlot(Long id) {
        if (!parkingSlotRepository.existsById(id)) {
            throw new ResourceNotFoundException("Parking slot", "id", id);
        }
        parkingSlotRepository.deleteById(id);
    }

    private ParkingSlot findParkingSlotOrThrow(Long id) {
        return parkingSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot", "id", id));
    }

    private ParkingArea findParkingAreaOrThrow(Long id) {
        return parkingAreaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking area", "id", id));
    }
}
