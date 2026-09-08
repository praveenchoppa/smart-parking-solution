package com.smartparking.backend.vehicle.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartparking.backend.vehicle.entity.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    boolean existsByVehicleNumber(String vehicleNumber);

    boolean existsByVehicleNumberAndIdNot(String vehicleNumber, Long id);

    List<Vehicle> findByUserId(Long userId);

    Optional<Vehicle> findByIdAndUserId(Long id, Long userId);
}
