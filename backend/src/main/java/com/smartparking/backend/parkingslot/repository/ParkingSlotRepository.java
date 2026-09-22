package com.smartparking.backend.parkingslot.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartparking.backend.parkingslot.entity.ParkingSlot;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {

    List<ParkingSlot> findByParkingAreaId(Long parkingAreaId);

    boolean existsByParkingAreaIdAndSlotNumber(Long parkingAreaId, String slotNumber);

    boolean existsByParkingAreaIdAndSlotNumberAndIdNot(Long parkingAreaId, String slotNumber, Long id);

    Optional<ParkingSlot> findByIdAndParkingAreaId(Long id, Long parkingAreaId);

    void deleteByParkingAreaId(Long parkingAreaId);
}
