package com.smartparking.backend.parkingarea.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartparking.backend.parkingarea.entity.ParkingArea;

public interface ParkingAreaRepository extends JpaRepository<ParkingArea, Long> {
}
