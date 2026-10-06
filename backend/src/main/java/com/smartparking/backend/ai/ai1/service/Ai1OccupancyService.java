package com.smartparking.backend.ai.ai1.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
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
@RequiredArgsConstructor
public class Ai1OccupancyService {

    private final Ai1Client ai1Client;
    private final ParkingAreaRepository parkingAreaRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final Ai1SlotStatusMapper slotStatusMapper;

    private final java.util.concurrent.atomic.AtomicInteger consecutiveFailures = new java.util.concurrent.atomic.AtomicInteger(0);
    private volatile long nextAllowedSyncTimeMs = 0;

    @Value("${app.ai1.scheduled-sync.enabled:true}")
    private boolean scheduledSyncEnabled;

    @Scheduled(fixedRateString = "${app.ai1.scheduled-sync-interval-ms:15000}")
    public void scheduledOccupancySync() {
        if (!scheduledSyncEnabled) {
            return;
        }

        long now = System.currentTimeMillis();
        if (now < nextAllowedSyncTimeMs) {
            return;
        }

        try {
            List<Ai1AreaInfoDto> areas = ai1Client.fetchAreas();
            if (areas != null && !areas.isEmpty()) {
                for (Ai1AreaInfoDto area : areas) {
                    Long ai1AreaId = area.getId();
                    if (ai1AreaId != null) {
                        parkingAreaRepository.findByAi1AreaIdOrId(ai1AreaId)
                                .ifPresent(pa -> syncParkingAreaOccupancy(ai1AreaId));
                    }
                }
            }

            int prevFailures = consecutiveFailures.getAndSet(0);
            nextAllowedSyncTimeMs = 0;
            if (prevFailures > 0) {
                log.info("AI-1 service reconnected successfully. Scheduled occupancy sync resumed for all areas.");
            }
        } catch (Exception ex) {
            int failureCount = consecutiveFailures.incrementAndGet();

            long backoffSeconds;
            if (failureCount == 1) {
                backoffSeconds = 15;
            } else if (failureCount == 2) {
                backoffSeconds = 30;
            } else if (failureCount == 3) {
                backoffSeconds = 60;
            } else {
                backoffSeconds = 120;
            }

            nextAllowedSyncTimeMs = System.currentTimeMillis() + (backoffSeconds * 1000L);

            log.warn("AI-1 service is unreachable: {}. Failure #{} — entering exponential backoff stage (next retry in {}s).",
                    ex.getMessage(), failureCount, backoffSeconds);
        }
    }

    public List<Ai1AreaInfoDto> getAi1Areas() {
        return ai1Client.fetchAreas();
    }

    public Ai1OccupancyResponse getAi1Occupancy(Long parkingAreaId) {
        com.smartparking.backend.parkingarea.entity.ParkingArea area = resolveParkingArea(parkingAreaId);
        Long ai1AreaId = area.getAi1AreaId() != null ? area.getAi1AreaId() : parkingAreaId;
        return ai1Client.fetchOccupancy(ai1AreaId);
    }

    @org.springframework.transaction.annotation.Transactional
    public Ai1SyncResultResponse syncParkingAreaOccupancy(Long targetAreaId) {
        com.smartparking.backend.parkingarea.entity.ParkingArea area = resolveParkingArea(targetAreaId);
        Long ai1AreaId = area.getAi1AreaId() != null ? area.getAi1AreaId() : targetAreaId;

        Ai1OccupancyResponse ai1Response = ai1Client.fetchOccupancy(ai1AreaId);
        List<ParkingSlot> dbSlots = parkingSlotRepository.findByParkingAreaId(area.getId());
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

        List<ParkingSlotResponse> syncedSlots = parkingSlotRepository.findByParkingAreaId(area.getId()).stream()
                .map(ParkingSlotResponse::fromEntity)
                .toList();

        return Ai1SyncResultResponse.builder()
                .parkingAreaId(area.getId())
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

    private com.smartparking.backend.parkingarea.entity.ParkingArea resolveParkingArea(Long targetAreaId) {
        return parkingAreaRepository.findByAi1AreaIdOrId(targetAreaId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking area", "id", targetAreaId));
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
        resolveParkingArea(parkingAreaId);
    }
}
