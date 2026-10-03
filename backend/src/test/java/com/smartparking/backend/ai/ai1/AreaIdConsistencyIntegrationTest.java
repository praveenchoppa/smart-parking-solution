package com.smartparking.backend.ai.ai1;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import com.smartparking.backend.ai.ai1.client.Ai1Client;
import com.smartparking.backend.ai.ai1.dto.Ai1OccupancyResponse;
import com.smartparking.backend.ai.ai1.service.Ai1OccupancyService;
import com.smartparking.backend.ai.ai3.client.Ai3Client;
import com.smartparking.backend.ai.ai3.dto.Ai3PredictionResponse;
import com.smartparking.backend.ai.ai3.service.Ai3PredictionService;
import com.smartparking.backend.parkingarea.entity.ParkingArea;
import com.smartparking.backend.parkingarea.repository.ParkingAreaRepository;
import com.smartparking.backend.parkingslot.entity.ParkingSlot;
import com.smartparking.backend.parkingslot.entity.SlotStatus;
import com.smartparking.backend.parkingslot.repository.ParkingSlotRepository;

@SpringBootTest
@Transactional
class AreaIdConsistencyIntegrationTest {

    @Autowired
    private ParkingAreaRepository parkingAreaRepository;

    @Autowired
    private ParkingSlotRepository parkingSlotRepository;

    @Autowired
    private Ai1OccupancyService ai1OccupancyService;

    @Autowired
    private Ai3PredictionService ai3PredictionService;

    @MockitoBean
    private Ai1Client ai1Client;

    @MockitoBean
    private Ai3Client ai3Client;

    private Long createdAreaId;

    @BeforeEach
    void setUp() {
        ParkingArea area2 = parkingAreaRepository.findAll().stream()
                .filter(a -> "North Annex Parking".equals(a.getName()))
                .findFirst()
                .orElseGet(() -> parkingAreaRepository.save(ParkingArea.builder()
                        .name("North Annex Parking")
                        .address("AI-1 Configured Area 2")
                        .latitude(12.98)
                        .longitude(77.60)
                        .hourlyRate(50.0)
                        .totalSlots(30)
                        .build()));

        createdAreaId = area2.getId();
        if (parkingSlotRepository.findByParkingAreaId(createdAreaId).isEmpty()) {
            for (int i = 1; i <= 30; i++) {
                parkingSlotRepository.save(ParkingSlot.builder()
                        .parkingArea(area2)
                        .slotNumber(String.format("A%02d", i))
                        .status(SlotStatus.AVAILABLE)
                        .build());
            }
        }
    }

    @Test
    @DisplayName("Verify end-to-end numeric area ID maps consistently across JPA, AI-1, and AI-3 services")
    void testAreaIdConsistencyEndToEnd() {
        // 1. Verify PostgreSQL DB layer primary key mapping
        ParkingArea areaFromDb = parkingAreaRepository.findById(createdAreaId).orElse(null);
        assertNotNull(areaFromDb, "Parking area must exist in database");
        assertEquals(createdAreaId, areaFromDb.getId(), "Database primary key must match created area ID");
        assertEquals("North Annex Parking", areaFromDb.getName());

        // 2. Mock AI-1 client response for Area
        Ai1OccupancyResponse mockAi1Response = new Ai1OccupancyResponse();
        mockAi1Response.setParkingAreaId(createdAreaId);
        mockAi1Response.setName("North Annex Parking");
        mockAi1Response.setSource("carPark2.mp4");
        mockAi1Response.setTotalSlots(30);
        mockAi1Response.setAvailableSlots(25);
        mockAi1Response.setOccupiedSlots(5);

        when(ai1Client.fetchOccupancy(eq(createdAreaId))).thenReturn(mockAi1Response);

        // Call AI-1 Occupancy Service with Area 2
        Ai1OccupancyResponse fetchedAi1 = ai1OccupancyService.getAi1Occupancy(createdAreaId);
        assertNotNull(fetchedAi1);
        assertEquals(createdAreaId, fetchedAi1.getParkingAreaId(), "AI-1 occupancy response must return parkingAreaId");

        // 3. Mock AI-3 client response for Area 2
        Ai3PredictionResponse mockAi3Response = Ai3PredictionResponse.builder()
                .predictedOccupancy(40.0)
                .predictedOccupiedSlots(12)
                .availableSlots(18)
                .build();

        when(ai3Client.predictOccupancy(org.mockito.ArgumentMatchers.any())).thenReturn(mockAi3Response);

        // Call AI-3 Prediction Service with Area 2
        Ai3PredictionResponse prediction = ai3PredictionService.predictForParkingArea(createdAreaId);
        assertNotNull(prediction);
        assertEquals(18, prediction.getAvailableSlots());
    }
}
