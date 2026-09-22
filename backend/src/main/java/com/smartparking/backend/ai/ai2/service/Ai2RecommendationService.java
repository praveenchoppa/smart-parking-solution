package com.smartparking.backend.ai.ai2.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.smartparking.backend.ai.ai2.client.Ai2Client;
import com.smartparking.backend.ai.ai2.dto.Ai2RecommendationItemDto;
import com.smartparking.backend.ai.ai2.dto.Ai2RecommendationRequest;
import com.smartparking.backend.ai.ai2.dto.Ai2RecommendationResponse;
import com.smartparking.backend.ai.ai2.dto.Ai2SlotInputDto;
import com.smartparking.backend.ai.ai2.exception.Ai2ServiceUnavailableException;
import com.smartparking.backend.parkingarea.dto.NearbyParkingAreaResponse;
import com.smartparking.backend.parkingarea.service.ParkingAreaService;
import com.smartparking.backend.parkingslot.entity.ParkingSlot;
import com.smartparking.backend.parkingslot.entity.SlotStatus;
import com.smartparking.backend.parkingslot.repository.ParkingSlotRepository;
import com.smartparking.backend.vehicle.entity.VehicleType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class Ai2RecommendationService {

    private final Ai2Client ai2Client;
    private final ParkingAreaService parkingAreaService;
    private final ParkingSlotRepository parkingSlotRepository;
    private final Ai2SlotFeatureMapper slotFeatureMapper;

    public Ai2RecommendationResponse recommend(Ai2RecommendationRequest request) {
        try {
            double radius = slotFeatureMapper.resolveRadius(request.getRadiusMeters());
            double destinationLatitude = request.getDestinationLatitude() != null
                    ? request.getDestinationLatitude()
                    : request.getLatitude();
            double destinationLongitude = request.getDestinationLongitude() != null
                    ? request.getDestinationLongitude()
                    : request.getLongitude();
            VehicleType vehicleType = request.getVehicleType() != null
                    ? request.getVehicleType()
                    : VehicleType.CAR;

            List<NearbyParkingAreaResponse> nearbyAreas = parkingAreaService.getNearbyParkingAreas(
                    request.getLatitude(),
                    request.getLongitude(),
                    radius);

            List<Ai2SlotContext> contexts = buildAvailableSlotContexts(
                    nearbyAreas,
                    destinationLatitude,
                    destinationLongitude,
                    request.getTrafficLevel(),
                    request.getWeather(),
                    vehicleType);

            if (contexts.isEmpty()) {
                return Ai2RecommendationResponse.noSlotsAvailable();
            }

            List<Ai2SlotInputDto> slotInputs = contexts.stream()
                    .map(Ai2SlotContext::getInput)
                    .toList();

            List<Ai2RecommendationItemDto> recommendations = ai2Client.recommend(slotInputs);
            if (recommendations.isEmpty()) {
                return Ai2RecommendationResponse.noSlotsAvailable();
            }

            Map<String, Ai2SlotContext> contextBySlotKey = indexContexts(contexts);
            Ai2RecommendationItemDto topRecommendation = recommendations.getFirst();
            Ai2SlotContext matchedContext = contextBySlotKey.get(
                    slotFeatureMapper.normalizeSlotKey(topRecommendation.getSlotId()));

            if (matchedContext == null) {
                log.warn("AI-2 top recommendation slot '{}' did not match any known parking slot.",
                        topRecommendation.getSlotId());
                return Ai2RecommendationResponse.unavailable(
                        "AI-2 returned a recommendation that could not be mapped to a parking slot.");
            }

            return Ai2RecommendationResponse.builder()
                    .recommendationAvailable(true)
                    .recommendedParkingAreaId(matchedContext.getArea().getId())
                    .recommendedParkingSlotId(matchedContext.getSlot().getId())
                    .recommendedSlotNumber(matchedContext.getSlot().getSlotNumber())
                    .recommendedParkingAreaName(matchedContext.getArea().getName())
                    .score(topRecommendation.getScore())
                    .reason(buildReason(matchedContext, topRecommendation))
                    .topRecommendations(recommendations)
                    .build();
        } catch (Ai2ServiceUnavailableException ex) {
            log.warn("AI-2 recommendation unavailable: {}", ex.getMessage());
            return Ai2RecommendationResponse.unavailable(ex.getMessage());
        }
    }

    private List<Ai2SlotContext> buildAvailableSlotContexts(
            List<NearbyParkingAreaResponse> nearbyAreas,
            double destinationLatitude,
            double destinationLongitude,
            String trafficLevel,
            String weather,
            VehicleType vehicleType) {

        List<Ai2SlotContext> contexts = new ArrayList<>();

        for (NearbyParkingAreaResponse area : nearbyAreas) {
            List<ParkingSlot> slots = parkingSlotRepository.findByParkingAreaId(area.getId());
            int areaOccupancyPercent = calculateAreaOccupancyPercent(slots, area.getTotalSlots());

            for (ParkingSlot slot : slots) {
                if (slot.getStatus() != SlotStatus.AVAILABLE) {
                    continue;
                }

                Ai2SlotInputDto input = slotFeatureMapper.toAi2Input(
                        area,
                        slot,
                        areaOccupancyPercent,
                        destinationLatitude,
                        destinationLongitude,
                        trafficLevel,
                        weather,
                        vehicleType);

                contexts.add(new Ai2SlotContext(area, slot, input));
            }
        }

        return contexts;
    }

    private int calculateAreaOccupancyPercent(List<ParkingSlot> slots, Integer totalSlotsFromArea) {
        if (slots == null || slots.isEmpty()) {
            return 0;
        }

        int occupiedOrReserved = (int) slots.stream()
                .filter(slot -> slot.getStatus() == SlotStatus.OCCUPIED || slot.getStatus() == SlotStatus.RESERVED)
                .count();
        int total = totalSlotsFromArea != null && totalSlotsFromArea > 0 ? totalSlotsFromArea : slots.size();

        if (total <= 0) {
            return 0;
        }

        return (int) Math.round((occupiedOrReserved * 100.0) / total);
    }

    private Map<String, Ai2SlotContext> indexContexts(List<Ai2SlotContext> contexts) {
        Map<String, Ai2SlotContext> indexed = new HashMap<>();
        for (Ai2SlotContext context : contexts) {
            indexed.put(slotFeatureMapper.normalizeSlotKey(context.getInput().getSlotId()), context);
        }
        return indexed;
    }

    private String buildReason(Ai2SlotContext context, Ai2RecommendationItemDto recommendation) {
        return String.format(
                "Recommended %s at %s based on distance (%.0f m), walking time (%.1f min), fee (%.0f), and AI score %.2f.",
                context.getSlot().getSlotNumber(),
                context.getArea().getName(),
                recommendation.getDistanceM() != null ? recommendation.getDistanceM() : 0.0,
                recommendation.getWalkingTimeMin() != null ? recommendation.getWalkingTimeMin() : 0.0,
                recommendation.getParkingFee() != null ? recommendation.getParkingFee() : 0.0,
                recommendation.getScore() != null ? recommendation.getScore() : 0.0);
    }
}
