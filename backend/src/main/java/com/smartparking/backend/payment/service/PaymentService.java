package com.smartparking.backend.payment.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.smartparking.backend.auth.security.SecurityUtils;
import com.smartparking.backend.booking.entity.Booking;
import com.smartparking.backend.booking.entity.BookingStatus;
import com.smartparking.backend.booking.repository.BookingRepository;
import com.smartparking.backend.common.exception.DuplicateResourceException;
import com.smartparking.backend.common.exception.InvalidOperationException;
import com.smartparking.backend.common.exception.ResourceNotFoundException;
import com.smartparking.backend.payment.dto.CreatePaymentRequest;
import com.smartparking.backend.payment.dto.PaymentResponse;
import com.smartparking.backend.payment.entity.Payment;
import com.smartparking.backend.payment.entity.PaymentMode;
import com.smartparking.backend.payment.entity.PaymentStatus;
import com.smartparking.backend.payment.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    public PaymentResponse makeSimulatedPayment(CreatePaymentRequest request) {
        Booking booking = findBookingOrThrow(request.getBookingId());
        SecurityUtils.requireSelfOrAdmin(booking.getUser().getId());

        if (paymentRepository.existsByBookingId(booking.getId())) {
            throw new DuplicateResourceException("Payment", "bookingId", booking.getId());
        }

        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new InvalidOperationException(
                    "Booking is not eligible for payment in its current status: " + booking.getStatus());
        }

        LocalDateTime paidAt = LocalDateTime.now();

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getAmount())
                .paymentMode(PaymentMode.SIMULATED)
                .status(PaymentStatus.SUCCESS)
                .paidAt(paidAt)
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        booking.setStatus(BookingStatus.PENDING_CHECK_IN);
        bookingRepository.save(booking);

        return PaymentResponse.fromEntity(savedPayment);
    }

    public PaymentResponse getPaymentByBookingId(Long bookingId) {
        Booking booking = findBookingOrThrow(bookingId);
        SecurityUtils.requireSelfOrAdmin(booking.getUser().getId());

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "bookingId", bookingId));

        return PaymentResponse.fromEntity(payment);
    }

    private Booking findBookingOrThrow(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
    }
}
