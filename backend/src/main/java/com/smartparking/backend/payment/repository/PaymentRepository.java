package com.smartparking.backend.payment.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartparking.backend.payment.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    boolean existsByBookingId(Long bookingId);

    Optional<Payment> findByBookingId(Long bookingId);
}
