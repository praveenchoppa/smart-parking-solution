package com.smartparking.backend.ai.ai1.bootstrap;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.IntStream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartparking.backend.parkingarea.entity.ParkingArea;
import com.smartparking.backend.parkingarea.repository.ParkingAreaRepository;
import com.smartparking.backend.parkingslot.entity.ParkingSlot;
import com.smartparking.backend.parkingslot.entity.SlotStatus;
import com.smartparking.backend.parkingslot.repository.ParkingSlotRepository;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class Ai1DemoBootstrapService {

    static final long DEMO_PARKING_AREA_ID = 1L;
    static final int DEMO_SLOT_COUNT = 69;
    static final String DEMO_AREA_NAME = "City Mall Main Lot";
    static final String DEMO_AREA_ADDRESS = "AI-1 Demo Parking Area";

    private final ParkingAreaRepository parkingAreaRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final EntityManager entityManager;

    @Transactional
    public BootstrapResult ensureDemoParkingArea() {
        if (parkingAreaRepository.existsById(DEMO_PARKING_AREA_ID)) {
            return validateExistingDemoArea();
        }

        insertDemoParkingArea();
        createDemoSlots();
        syncParkingAreaSequence();

        log.info(
                "AI-1 demo parking area created (id={}, {} slots A01-A69).",
                DEMO_PARKING_AREA_ID,
                DEMO_SLOT_COUNT);
        return BootstrapResult.created(DEMO_PARKING_AREA_ID, DEMO_SLOT_COUNT);
    }

    private BootstrapResult validateExistingDemoArea() {
        ParkingArea area = parkingAreaRepository.findById(DEMO_PARKING_AREA_ID).orElseThrow();
        List<ParkingSlot> slots = parkingSlotRepository.findByParkingAreaId(DEMO_PARKING_AREA_ID);

        if (isValidAi1DemoArea(area, slots)) {
            log.info(
                    "AI-1 demo parking area already aligned (id={}, {} slots A01-A69).",
                    DEMO_PARKING_AREA_ID,
                    DEMO_SLOT_COUNT);
            return BootstrapResult.alreadyPresent(DEMO_PARKING_AREA_ID, DEMO_SLOT_COUNT);
        }

        String conflictDetails = describeConflict(area, slots);
        log.warn(
                "AI-1 demo parking area id={} exists but does not match the required A01-A69 layout. {}",
                DEMO_PARKING_AREA_ID,
                conflictDetails);
        return BootstrapResult.conflict(DEMO_PARKING_AREA_ID, conflictDetails);
    }

    private void insertDemoParkingArea() {
        entityManager.createNativeQuery("""
                INSERT INTO parking_areas (id, name, address, latitude, longitude, hourly_rate, total_slots)
                VALUES (:id, :name, :address, :latitude, :longitude, :hourlyRate, :totalSlots)
                """)
                .setParameter("id", DEMO_PARKING_AREA_ID)
                .setParameter("name", DEMO_AREA_NAME)
                .setParameter("address", DEMO_AREA_ADDRESS)
                .setParameter("latitude", 12.9716)
                .setParameter("longitude", 77.5946)
                .setParameter("hourlyRate", 40.0)
                .setParameter("totalSlots", DEMO_SLOT_COUNT)
                .executeUpdate();
        entityManager.flush();
    }

    private void createDemoSlots() {
        ParkingArea parkingArea = parkingAreaRepository.findById(DEMO_PARKING_AREA_ID).orElseThrow();

        IntStream.rangeClosed(1, DEMO_SLOT_COUNT)
                .mapToObj(slotIndex -> ParkingSlot.builder()
                        .parkingArea(parkingArea)
                        .slotNumber(formatAi1SlotNumber(slotIndex))
                        .status(SlotStatus.AVAILABLE)
                        .build())
                .forEach(parkingSlotRepository::save);
    }

    private void syncParkingAreaSequence() {
        entityManager.createNativeQuery("""
                SELECT setval(
                    pg_get_serial_sequence('parking_areas', 'id'),
                    GREATEST((SELECT COALESCE(MAX(id), 1) FROM parking_areas), 1)
                )
                """)
                .getSingleResult();
    }

    static String formatAi1SlotNumber(int slotIndex) {
        return String.format(Locale.ROOT, "A%02d", slotIndex);
    }

    static Set<String> expectedAi1SlotNumbers() {
        Set<String> expected = new HashSet<>();
        IntStream.rangeClosed(1, DEMO_SLOT_COUNT)
                .mapToObj(Ai1DemoBootstrapService::formatAi1SlotNumber)
                .forEach(expected::add);
        return expected;
    }

    static boolean isValidAi1DemoArea(ParkingArea area, List<ParkingSlot> slots) {
        if (area.getTotalSlots() != DEMO_SLOT_COUNT || slots.size() != DEMO_SLOT_COUNT) {
            return false;
        }

        Set<String> expected = expectedAi1SlotNumbers();
        Set<String> actual = new HashSet<>();
        for (ParkingSlot slot : slots) {
            actual.add(slot.getSlotNumber().trim().toUpperCase(Locale.ROOT));
        }
        return expected.equals(actual);
    }

    private static String describeConflict(ParkingArea area, List<ParkingSlot> slots) {
        StringBuilder details = new StringBuilder();
        details.append("Expected totalSlots=69 with slot numbers A01-A69. ");
        details.append("Found totalSlots=").append(area.getTotalSlots());
        details.append(", slotCount=").append(slots.size()).append(".");

        if (!slots.isEmpty()) {
            List<String> sampleNumbers = slots.stream()
                    .map(ParkingSlot::getSlotNumber)
                    .limit(5)
                    .toList();
            details.append(" Sample slot numbers: ").append(sampleNumbers).append(".");
        }

        details.append(
                " Remove or rename the conflicting area manually, or delete it from Admin if it has no booking history.");
        return details.toString();
    }

    public record BootstrapResult(
            Status status,
            long parkingAreaId,
            int slotCount,
            String message) {

        enum Status {
            CREATED,
            ALREADY_PRESENT,
            CONFLICT
        }

        static BootstrapResult created(long parkingAreaId, int slotCount) {
            return new BootstrapResult(
                    Status.CREATED,
                    parkingAreaId,
                    slotCount,
                    "AI-1 demo parking area created.");
        }

        static BootstrapResult alreadyPresent(long parkingAreaId, int slotCount) {
            return new BootstrapResult(
                    Status.ALREADY_PRESENT,
                    parkingAreaId,
                    slotCount,
                    "AI-1 demo parking area already aligned.");
        }

        static BootstrapResult conflict(long parkingAreaId, String message) {
            return new BootstrapResult(
                    Status.CONFLICT,
                    parkingAreaId,
                    0,
                    message);
        }
    }
}
