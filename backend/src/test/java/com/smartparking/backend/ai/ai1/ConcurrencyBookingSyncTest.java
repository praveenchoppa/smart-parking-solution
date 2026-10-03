package com.smartparking.backend.ai.ai1;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import com.smartparking.backend.ai.ai1.client.Ai1Client;
import com.smartparking.backend.ai.ai1.dto.Ai1DetectedSlotDto;
import com.smartparking.backend.ai.ai1.dto.Ai1OccupancyResponse;
import com.smartparking.backend.ai.ai1.service.Ai1OccupancyService;
import com.smartparking.backend.booking.dto.CreateBookingRequest;
import com.smartparking.backend.booking.service.BookingService;
import com.smartparking.backend.parkingarea.entity.ParkingArea;
import com.smartparking.backend.parkingarea.repository.ParkingAreaRepository;
import com.smartparking.backend.parkingslot.entity.ParkingSlot;
import com.smartparking.backend.parkingslot.entity.SlotStatus;
import com.smartparking.backend.parkingslot.repository.ParkingSlotRepository;
import com.smartparking.backend.user.entity.Role;
import com.smartparking.backend.user.entity.User;
import com.smartparking.backend.user.repository.UserRepository;
import com.smartparking.backend.vehicle.entity.Vehicle;
import com.smartparking.backend.vehicle.entity.VehicleType;
import com.smartparking.backend.vehicle.repository.VehicleRepository;

@SpringBootTest
class ConcurrencyBookingSyncTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private Ai1OccupancyService ai1OccupancyService;

    @Autowired
    private ParkingAreaRepository parkingAreaRepository;

    @Autowired
    private ParkingSlotRepository parkingSlotRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @MockitoBean
    private Ai1Client ai1Client;

    private User testUser;
    private Vehicle testVehicle;
    private ParkingArea testArea;
    private ParkingSlot targetSlot;

    @BeforeEach
    void setUp() {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);

        testUser = userRepository.save(User.builder()
                .name("Concurrency Tester")
                .email("test-" + uniqueSuffix + "@example.com")
                .phone("999" + uniqueSuffix)
                .role(Role.USER)
                .build());

        testVehicle = vehicleRepository.save(Vehicle.builder()
                .user(testUser)
                .vehicleNumber("KA-01-" + uniqueSuffix.toUpperCase())
                .vehicleType(VehicleType.CAR)
                .build());

        testArea = parkingAreaRepository.save(ParkingArea.builder()
                .name("Concurrency Control Area " + uniqueSuffix)
                .address("123 Test Street")
                .latitude(12.97)
                .longitude(77.59)
                .hourlyRate(50.0)
                .totalSlots(10)
                .build());

        targetSlot = parkingSlotRepository.save(ParkingSlot.builder()
                .parkingArea(testArea)
                .slotNumber("A01")
                .status(SlotStatus.AVAILABLE)
                .build());

        for (int i = 2; i <= 10; i++) {
            parkingSlotRepository.save(ParkingSlot.builder()
                    .parkingArea(testArea)
                    .slotNumber(String.format("A%02d", i))
                    .status(SlotStatus.AVAILABLE)
                    .build());
        }
    }

    @Test
    @DisplayName("Run 25 iterations of concurrent booking vs sync: RESERVED booking is never lost")
    void testConcurrentBookingAndSync25Iterations() throws Exception {
        Ai1DetectedSlotDto slot1 = new Ai1DetectedSlotDto();
        slot1.setSlotId(1);
        slot1.setSlotNumber("A01");
        slot1.setStatus("AVAILABLE");

        Ai1DetectedSlotDto slot2 = new Ai1DetectedSlotDto();
        slot2.setSlotId(2);
        slot2.setSlotNumber("A02");
        slot2.setStatus("AVAILABLE");

        Ai1OccupancyResponse mockOccupancy = new Ai1OccupancyResponse();
        mockOccupancy.setParkingAreaId(testArea.getId());
        mockOccupancy.setName(testArea.getName());
        mockOccupancy.setSource("test.mp4");
        mockOccupancy.setTotalSlots(10);
        mockOccupancy.setAvailableSlots(10);
        mockOccupancy.setOccupiedSlots(0);
        mockOccupancy.setSlots(List.of(slot1, slot2));

        when(ai1Client.fetchOccupancy(anyLong())).thenReturn(mockOccupancy);

        int iterations = 25;
        for (int iter = 0; iter < iterations; iter++) {
            ParkingSlot currentSlot = parkingSlotRepository.findById(targetSlot.getId()).orElseThrow();
            currentSlot.setStatus(SlotStatus.AVAILABLE);
            parkingSlotRepository.saveAndFlush(currentSlot);

            ExecutorService executor = Executors.newFixedThreadPool(2);
            CountDownLatch readyLatch = new CountDownLatch(2);
            CountDownLatch startLatch = new CountDownLatch(1);
            CountDownLatch finishLatch = new CountDownLatch(2);

            CreateBookingRequest bookingRequest = new CreateBookingRequest();
            bookingRequest.setUserId(testUser.getId());
            bookingRequest.setVehicleId(testVehicle.getId());
            bookingRequest.setParkingAreaId(testArea.getId());
            bookingRequest.setParkingSlotId(targetSlot.getId());
            bookingRequest.setDurationHours(2);

            executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await();
                    bookingService.createBooking(bookingRequest);
                } catch (Exception ignored) {
                } finally {
                    finishLatch.countDown();
                }
            });

            executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await();
                    ai1OccupancyService.syncParkingAreaOccupancy(testArea.getId());
                } catch (Exception ignored) {
                } finally {
                    finishLatch.countDown();
                }
            });

            readyLatch.await();
            startLatch.countDown();
            finishLatch.await(5, TimeUnit.SECONDS);
            executor.shutdownNow();

            ParkingSlot finalSlotState = parkingSlotRepository.findById(targetSlot.getId()).orElseThrow();
            assertEquals(SlotStatus.RESERVED, finalSlotState.getStatus(),
                    "Iteration " + (iter + 1) + " failed: Concurrent sync overwrote RESERVED slot status!");
        }
    }
}
