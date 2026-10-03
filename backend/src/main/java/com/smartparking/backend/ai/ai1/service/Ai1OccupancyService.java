package com.smartparking.backend.ai.ai1.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.smartparking.backend.ai.ai1.client.Ai1Client;
import com.smartparking.backend.ai.ai1.dto.Ai1AreaInfoDto;
import com.smartparking.backend.ai.ai1.dto.Ai1DetectedSlotDto;
import com.smartparking.backend.ai.ai1.dto.Ai1OccupancyResponse;
import com.smartparking.backend.ai.ai1.dto.Ai1SyncResultResponse;
import com.smartparking.backend.common.exception.ResourceNotFoundException;
import com.smartparking.backend.parkingarea.repository.ParkingAreaRepository;
import com.smartparking.backend.parkingslot.dto.ParkingSlotResponse;
import com.smartparking.backend.parkingslot.entity.ParkingSlot;
import com.smartparking.backend.parkingslot.entity.SlotStatus;
import com.smartparking.backend.parkingslot.repository.ParkingSlotRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@EnableScheduling
@RequiredArgsConstructor
public class Ai1OccupancyService {

    private final Ai1Client ai1Client;
    private final ParkingAreaRepository parkingAreaRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final Ai1SlotStatusMapper slotStatusMapper;

    @Value("${app.ai1.scheduled-sync.enabled:true}")
    private boolean scheduledSyncEnabled;

    @Scheduled(fixedRateString = "${app.ai1.scheduled-sync-interval-ms:10000}")
    public void scheduledOccupancySync() {
        if (!scheduledSyncEnabled) {
            return;
        }

        try {
            List<Ai1AreaInfoDto> areas = ai1Client.fetchAreas();
            if (areas == null || areas.isEmpty()) {
                return;
            }

            for (Ai1AreaInfoDto area : areas) {
                Long areaId = area.getId();
                if (areaId != null && parkingAreaRepository.existsById(areaId)) {
                    syncParkingAreaOccupancy(areaId);
                }
            }
        } catch (Exception ex) {
            log.warn("Scheduled AI-1 occupancy sync skipped: {}", ex.getMessage());
        }
    }

    public List<Ai1AreaInfoDto> getAi1Areas() {
        return ai1Client.fetchAreas();
    }

    public Ai1OccupancyResponse getAi1Occupancy(Long parkingAreaId) {
        verifyParkingAreaExists(parkingAreaId);
        return ai1Client.fetchOccupancy(parkingAreaId);
    }

    public Ai1SyncResultResponse syncParkingAreaOccupancy(Long parkingAreaId) {
        verifyParkingAreaExists(parkingAreaId);

        Ai1OccupancyResponse ai1Response = ai1Client.fetchOccupancy(parkingAreaId);
        List<ParkingSlot> dbSlots = parkingSlotRepository.findByParkingAreaId(parkingAreaId);
        Map<String, ParkingSlot> slotsByNumber = indexSlotsByNormalizedNumber(dbSlots);

        int updatedSlots = 0;
        int unchangedSlots = 0;
        List<String> unmatchedAiSlotNumbers = new ArrayList<>();

        if (ai1Response.getSlots() != null) {
            for (Ai1DetectedSlotDto detectedSlot : ai1Response.getSlots()) {
                String normalizedNumber = slotStatusMapper.normalizeSlotNumber(detectedSlot.getSlotNumber());
                ParkingSlot parkingSlot = slotsByNumber.get(normalizedNumber);

                if (parkingSlot == null) {
                    unmatchedAiSlotNumbers.add(detectedSlot.getSlotNumber());
                    continue;
                }

                SlotStatus aiPhysicalStatus = slotStatusMapper.toPhysicalStatus(detectedSlot.getStatus());
                SlotStatus mergedStatus = slotStatusMapper.mergeWithBusinessRules(
                        parkingSlot.getStatus(),
                        aiPhysicalStatus);

                if (parkingSlot.getStatus() != mergedStatus) {
                    parkingSlot.setStatus(mergedStatus);
                    parkingSlotRepository.save(parkingSlot);
                    updatedSlots++;
                } else {
                    unchangedSlots++;
                }
            }
        }

        List<ParkingSlotResponse> syncedSlots = parkingSlotRepository.findByParkingAreaId(parkingAreaId).stream()
                .map(ParkingSlotResponse::fromEntity)
                .toList();

        return Ai1SyncResultResponse.builder()
                .parkingAreaId(parkingAreaId)
                .ai1Timestamp(ai1Response.getTimestamp())
                .ai1Source(ai1Response.getSource())
                .totalAiDetections(ai1Response.getSlots() != null ? ai1Response.getSlots().size() : 0)
                .updatedSlots(updatedSlots)
                .unchangedSlots(unchangedSlots)
                .unmatchedAiSlots(unmatchedAiSlotNumbers.size())
                .unmatchedAiSlotNumbers(unmatchedAiSlotNumbers)
                .slots(syncedSlots)
                .build();
    }

    private Map<String, ParkingSlot> indexSlotsByNormalizedNumber(List<ParkingSlot> dbSlots) {
        Map<String, ParkingSlot> slotsByNumber = new HashMap<>();
        for (ParkingSlot parkingSlot : dbSlots) {
            slotsByNumber.put(
                    slotStatusMapper.normalizeSlotNumber(parkingSlot.getSlotNumber()),
                    parkingSlot);
        }
        return slotsByNumber;
    }

    private void verifyParkingAreaExists(Long parkingAreaId) {
        if (!parkingAreaRepository.existsById(parkingAreaId)) {
            throw new ResourceNotFoundException("Parking area", "id", parkingAreaId);
        }
    }
}
