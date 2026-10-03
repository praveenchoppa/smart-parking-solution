package com.smartparking.backend.ai.ai3.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smartparking.backend.ai.ai3.client.Ai3Client;
import com.smartparking.backend.ai.ai3.dto.Ai3PredictionRequest;
import com.smartparking.backend.ai.ai3.dto.Ai3PredictionResponse;
import com.smartparking.backend.common.exception.ResourceNotFoundException;
import com.smartparking.backend.parkingarea.entity.ParkingArea;
import com.smartparking.backend.parkingarea.repository.ParkingAreaRepository;
import com.smartparking.backend.parkingslot.entity.ParkingSlot;
import com.smartparking.backend.parkingslot.entity.SlotStatus;
import com.smartparking.backend.parkingslot.repository.ParkingSlotRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class Ai3PredictionService {

    private final Ai3Client ai3Client;
    private final ParkingAreaRepository parkingAreaRepository;
    private final ParkingSlotRepository parkingSlotRepository;

    public Ai3PredictionResponse predictForParkingArea(Long parkingAreaId) {
        ParkingArea area = parkingAreaRepository.findById(parkingAreaId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking area", "id", parkingAreaId));

        List<ParkingSlot> slots = parkingSlotRepository.findByParkingAreaId(parkingAreaId);
        int totalSlots = area.getTotalSlots() != null && area.getTotalSlots() > 0 ? area.getTotalSlots() : slots.size();
        if (totalSlots == 0) {
            totalSlots = 69;
        }

        long occupiedCount = slots.stream()
                .filter(s -> s.getStatus() == SlotStatus.OCCUPIED || s.getStatus() == SlotStatus.RESERVED)
                .count();

        double currentOccupancy = totalSlots > 0 ? (double) occupiedCount / totalSlots * 100.0 : 0.0;
        double previousOccupancy = Math.max(0.0, currentOccupancy - 5.0); // Estimate previous cycle occupancy

        String dateStr = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
        String timeStr = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm"));

        // Format parkingAreaId string for model baseline (e.g. A01)
        String modelAreaCode = String.format("A%02d", Math.min(parkingAreaId.intValue(), 99));

        Ai3PredictionRequest request = Ai3PredictionRequest.builder()
                .date(dateStr)
                .time(timeStr)
                .parkingAreaId(modelAreaCode)
                .totalSlots(totalSlots)
                .previousOccupancy(round2(previousOccupancy))
                .currentOccupancy(round2(currentOccupancy))
                .build();

        return ai3Client.predictOccupancy(request);
    }

    public Ai3PredictionResponse predictCustom(Ai3PredictionRequest request) {
        return ai3Client.predictOccupancy(request);
    }

    private double round2(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
