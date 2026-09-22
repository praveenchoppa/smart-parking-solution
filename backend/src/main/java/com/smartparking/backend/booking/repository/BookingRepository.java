package com.smartparking.backend.booking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartparking.backend.booking.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    boolean existsByBookingCode(String bookingCode);

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Booking> findByIdAndUserId(Long id, Long userId);

    Optional<Booking> findByBookingCode(String bookingCode);

    boolean existsByParkingAreaId(Long parkingAreaId);
}
