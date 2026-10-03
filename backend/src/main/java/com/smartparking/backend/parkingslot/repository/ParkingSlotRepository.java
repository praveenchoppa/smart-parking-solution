package com.smartparking.backend.parkingslot.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartparking.backend.parkingslot.entity.ParkingSlot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {

    List<ParkingSlot> findByParkingAreaId(Long parkingAreaId);

    boolean existsByParkingAreaIdAndSlotNumber(Long parkingAreaId, String slotNumber);

    boolean existsByParkingAreaIdAndSlotNumberAndIdNot(Long parkingAreaId, String slotNumber, Long id);

    Optional<ParkingSlot> findByIdAndParkingAreaId(Long id, Long parkingAreaId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM ParkingSlot s WHERE s.parkingArea.id = :parkingAreaId AND s.id = :id")
    Optional<ParkingSlot> findByParkingAreaIdAndIdWithLock(@Param("parkingAreaId") Long parkingAreaId, @Param("id") Long id);

    void deleteByParkingAreaId(Long parkingAreaId);
}
