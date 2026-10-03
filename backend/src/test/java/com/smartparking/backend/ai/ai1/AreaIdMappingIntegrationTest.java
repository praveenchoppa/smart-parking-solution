package com.smartparking.backend.ai.ai1;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import com.smartparking.backend.ai.ai1.client.Ai1Client;
import com.smartparking.backend.ai.ai1.dto.Ai1DetectedSlotDto;
import com.smartparking.backend.ai.ai1.dto.Ai1OccupancyResponse;
import com.smartparking.backend.ai.ai1.service.Ai1OccupancyService;
import com.smartparking.backend.parkingarea.entity.ParkingArea;
import com.smartparking.backend.parkingarea.repository.ParkingAreaRepository;
import com.smartparking.backend.parkingslot.entity.ParkingSlot;
import com.smartparking.backend.parkingslot.entity.SlotStatus;
import com.smartparking.backend.parkingslot.repository.ParkingSlotRepository;

@SpringBootTest
class AreaIdMappingIntegrationTest {

    @Autowired
    private Ai1OccupancyService ai1OccupancyService;

    @Autowired
    private ParkingAreaRepository parkingAreaRepository;

    @Autowired
    private ParkingSlotRepository parkingSlotRepository;

    @MockitoBean
    private Ai1Client ai1Client;

    @Test
    @DisplayName("Verify explicit ai1AreaId mapping resolves correctly when JPA primary keys differ from AI-1 area IDs")
    void testAreaIdMappingDeliberateMismatch() {
        // Step 1: Create Area 1 with ai1AreaId = 1 (JPA id auto-assigned)
        ParkingArea area1 = parkingAreaRepository.save(ParkingArea.builder()
                .name("First Area")
                .address("100 First Street")
                .latitude(12.91)
                .longitude(77.51)
                .hourlyRate(40.0)
                .totalSlots(2)
                .ai1AreaId(1L)
                .build());

        // Step 2: Create a dummy area to advance auto-increment JPA ID
        ParkingArea dummyArea = parkingAreaRepository.save(ParkingArea.builder()
                .name("Dummy Intermediate Area")
                .address("200 Intermediate Street")
                .latitude(12.92)
                .longitude(77.52)
                .hourlyRate(30.0)
                .totalSlots(2)
                .ai1AreaId(999L)
                .build());

        // Step 3: Create AI-1 Area 2 with ai1AreaId = 2 (JPA id auto-assigned, will be > 2)
        ParkingArea area2Recreated = parkingAreaRepository.save(ParkingArea.builder()
                .name("Recreated Area 2")
                .address("300 Recreated Street")
                .latitude(12.93)
                .longitude(77.53)
                .hourlyRate(50.0)
                .totalSlots(2)
                .ai1AreaId(2L)
                .build());

        ParkingSlot slot1Area2 = parkingSlotRepository.save(ParkingSlot.builder()
                .parkingArea(area2Recreated)
                .slotNumber("A01")
                .status(SlotStatus.AVAILABLE)
                .build());

        // Confirm JPA primary key is different from AI-1 area ID (2)
        assertNotEquals(2L, area2Recreated.getId(), "JPA primary key should differ from AI-1 areaId=2 due to sequence advancement!");
        assertEquals(2L, area2Recreated.getAi1AreaId(), "ai1AreaId column must store explicit AI-1 identifier 2!");

        // Step 4: Mock AI-1 client returning occupancy for AI-1 area 2
        Ai1DetectedSlotDto detectedSlot = new Ai1DetectedSlotDto();
        detectedSlot.setSlotId(1);
        detectedSlot.setSlotNumber("A01");
        detectedSlot.setStatus("OCCUPIED");

        Ai1OccupancyResponse mockOccupancy = new Ai1OccupancyResponse();
        mockOccupancy.setParkingAreaId(2L);
        mockOccupancy.setName(area2Recreated.getName());
        mockOccupancy.setSlots(List.of(detectedSlot));

        when(ai1Client.fetchOccupancy(eq(2L))).thenReturn(mockOccupancy);

        // Step 5: Sync occupancy for AI-1 area 2
        ai1OccupancyService.syncParkingAreaOccupancy(2L);

        // Step 6: Verify slot in DB area2Recreated (JPA ID) was updated to OCCUPIED
        ParkingSlot updatedSlot = parkingSlotRepository.findById(slot1Area2.getId()).orElseThrow();
        assertEquals(SlotStatus.OCCUPIED, updatedSlot.getStatus(),
                "AI-1 occupancy sync for area 2 must correctly map to database entity with ai1AreaId=2 despite JPA ID mismatch!");
    }
}
