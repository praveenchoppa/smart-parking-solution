package com.smartparking.backend.vehicle.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.smartparking.backend.common.exception.DuplicateResourceException;
import com.smartparking.backend.common.exception.ResourceNotFoundException;
import com.smartparking.backend.user.entity.User;
import com.smartparking.backend.user.repository.UserRepository;
import com.smartparking.backend.vehicle.dto.CreateVehicleRequest;
import com.smartparking.backend.vehicle.dto.UpdateVehicleRequest;
import com.smartparking.backend.vehicle.dto.VehicleResponse;
import com.smartparking.backend.vehicle.entity.Vehicle;
import com.smartparking.backend.vehicle.repository.VehicleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public VehicleResponse createVehicle(Long userId, CreateVehicleRequest request) {
        User user = findUserOrThrow(userId);

        if (vehicleRepository.existsByVehicleNumber(request.getVehicleNumber())) {
            throw new DuplicateResourceException("Vehicle", "vehicleNumber", request.getVehicleNumber());
        }

        Vehicle vehicle = Vehicle.builder()
                .user(user)
                .vehicleNumber(request.getVehicleNumber().toUpperCase())
                .vehicleType(request.getVehicleType())
                .build();

        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return VehicleResponse.fromEntity(savedVehicle);
    }

    public VehicleResponse getVehicleById(Long userId, Long vehicleId) {
        findUserOrThrow(userId);
        Vehicle vehicle = findVehicleForUserOrThrow(userId, vehicleId);
        return VehicleResponse.fromEntity(vehicle);
    }

    public List<VehicleResponse> getVehiclesByUserId(Long userId) {
        findUserOrThrow(userId);
        return vehicleRepository.findByUserId(userId).stream()
                .map(VehicleResponse::fromEntity)
                .toList();
    }

    public VehicleResponse updateVehicle(Long userId, Long vehicleId, UpdateVehicleRequest request) {
        findUserOrThrow(userId);
        Vehicle vehicle = findVehicleForUserOrThrow(userId, vehicleId);

        if (vehicleRepository.existsByVehicleNumberAndIdNot(request.getVehicleNumber(), vehicleId)) {
            throw new DuplicateResourceException("Vehicle", "vehicleNumber", request.getVehicleNumber());
        }

        vehicle.setVehicleNumber(request.getVehicleNumber().toUpperCase());
        vehicle.setVehicleType(request.getVehicleType());

        return VehicleResponse.fromEntity(vehicle);
    }

    public void deleteVehicle(Long userId, Long vehicleId) {
        findUserOrThrow(userId);
        Vehicle vehicle = findVehicleForUserOrThrow(userId, vehicleId);
        vehicleRepository.delete(vehicle);
    }

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    private Vehicle findVehicleForUserOrThrow(Long userId, Long vehicleId) {
        return vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));
    }
}
