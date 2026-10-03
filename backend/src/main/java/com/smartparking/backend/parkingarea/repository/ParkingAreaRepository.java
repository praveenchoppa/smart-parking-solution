package com.smartparking.backend.parkingarea.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import com.smartparking.backend.parkingarea.entity.ParkingArea;

public interface ParkingAreaRepository extends JpaRepository<ParkingArea, Long> {
    Optional<ParkingArea> findByAi1AreaId(Long ai1AreaId);
    boolean existsByAi1AreaId(Long ai1AreaId);

    default Optional<ParkingArea> findByAi1AreaIdOrId(Long areaId) {
        Optional<ParkingArea> byAi1 = findByAi1AreaId(areaId);
        if (byAi1.isPresent()) {
            return byAi1;
        }
        return findById(areaId);
    }
}
