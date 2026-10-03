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

    private final java.util.concurrent.atomic.AtomicInteger consecutiveFailures = new java.util.concurrent.atomic.AtomicInteger(0);

    @Value("${app.ai1.scheduled-sync.enabled:true}")
    private boolean scheduledSyncEnabled;

    @Scheduled(fixedRateString = "${app.ai1.scheduled-sync-interval-ms:15000}")
    public void scheduledOccupancySync() {
        if (!scheduledSyncEnabled) {
            return;
        }

        int failures = consecutiveFailures.get();
        if (failures > 1) {
            int skipCycles = Math.min(failures, 6);
            if ((System.currentTimeMillis() / 1000) % skipCycles != 0) {
                return;
            }
        }

        try {
            List<Ai1AreaInfoDto> areas = ai1Client.fetchAreas();
            if (areas != null && !areas.isEmpty()) {
                for (Ai1AreaInfoDto area : areas) {
                    Long areaId = area.getId();
                    if (areaId != null && parkingAreaRepository.existsById(areaId)) {
                        syncParkingAreaOccupancy(areaId);
                    }
                }
            }

            if (consecutiveFailures.getAndSet(0) > 0) {
                log.info("AI-1 service reconnected successfully. Scheduled occupancy sync resumed for all areas.");
            }
        } catch (Exception ex) {
            int newFailures = consecutiveFailures.incrementAndGet();
            if (newFailures == 1) {
                log.warn("AI-1 service is unreachable: {}. Entering backoff mode for scheduled occupancy sync.", ex.getMessage());
            } else if (newFailures % 5 == 0) {
                log.warn("AI-1 service remains unreachable (consecutive failures: {}). Scheduled sync in backoff mode.", newFailures);
            }
        }
    }

    public List<Ai1AreaInfoDto> getAi1Areas() {
        return ai1Client.fetchAreas();
    }

    public Ai1OccupancyResponse getAi1Occupancy(Long parkingAreaId) {
        verifyParkingAreaExists(parkingAreaId);
        return ai1Client.fetchOccupancy(parkingAreaId);
    }

    @org.springframework.transaction.annotation.Transactional
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
                ParkingSlot cachedSlot = slotsByNumber.get(normalizedNumber);

                if (cachedSlot == null) {
                    unmatchedAiSlotNumbers.add(detectedSlot.getSlotNumber());
                    continue;
                }

                // Re-fetch latest slot status from DB inside transaction to check concurrent updates
                ParkingSlot parkingSlot = parkingSlotRepository.findById(cachedSlot.getId()).orElse(cachedSlot);

                SlotStatus aiPhysicalStatus = slotStatusMapper.toPhysicalStatus(detectedSlot.getStatus());
                SlotStatus mergedStatus = slotStatusMapper.mergeWithBusinessRules(
                        parkingSlot.getStatus(),
                        aiPhysicalStatus);

                if (parkingSlot.getStatus() != mergedStatus) {
                    try {
                        parkingSlot.setStatus(mergedStatus);
                        parkingSlotRepository.save(parkingSlot);
                        updatedSlots++;
                    } catch (org.springframework.orm.ObjectOptimisticLockingFailureException | jakarta.persistence.OptimisticLockException ex) {
                        log.warn("Optimistic lock prevented sync update for slot {} (modified concurrently by booking). Preserving DB status.", parkingSlot.getSlotNumber());
                        unchangedSlots++;
                    }
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
