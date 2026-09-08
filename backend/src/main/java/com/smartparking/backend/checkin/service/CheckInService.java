package com.smartparking.backend.checkin.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.smartparking.backend.booking.entity.Booking;
import com.smartparking.backend.booking.entity.BookingStatus;
import com.smartparking.backend.booking.repository.BookingRepository;
import com.smartparking.backend.checkin.dto.CheckInRequest;
import com.smartparking.backend.checkin.dto.CheckInResponse;
import com.smartparking.backend.common.exception.InvalidOperationException;
import com.smartparking.backend.common.exception.ResourceNotFoundException;
import com.smartparking.backend.payment.entity.Payment;
import com.smartparking.backend.payment.entity.PaymentStatus;
import com.smartparking.backend.payment.repository.PaymentRepository;
import com.smartparking.backend.parkingslot.entity.ParkingSlot;
import com.smartparking.backend.parkingslot.entity.SlotStatus;
import com.smartparking.backend.parkingslot.repository.ParkingSlotRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CheckInService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final ParkingSlotRepository parkingSlotRepository;

    public CheckInResponse checkIn(CheckInRequest request) {
        Booking booking = bookingRepository.findByBookingCode(request.getBookingCode())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "bookingCode", request.getBookingCode()));

        validateBookingEligibleForCheckIn(booking);

        Payment payment = paymentRepository.findByBookingId(booking.getId())
                .orElseThrow(() -> new InvalidOperationException("Payment has not been completed for this booking"));

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new InvalidOperationException("Payment has not been completed for this booking");
        }

        ParkingSlot parkingSlot = parkingSlotRepository.findById(booking.getParkingSlot().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Parking slot", "id", booking.getParkingSlot().getId()));

        if (parkingSlot.getStatus() != SlotStatus.RESERVED) {
            throw new InvalidOperationException(
                    "Parking slot is not in the expected state for check-in: " + parkingSlot.getStatus());
        }

        LocalDateTime checkedInAt = LocalDateTime.now();

        booking.setStatus(BookingStatus.CHECKED_IN);
        bookingRepository.save(booking);

        parkingSlot.setStatus(SlotStatus.OCCUPIED);
        parkingSlotRepository.save(parkingSlot);

        return CheckInResponse.from(booking, parkingSlot.getStatus(), checkedInAt);
    }

    private void validateBookingEligibleForCheckIn(Booking booking) {
        if (booking.getStatus() == BookingStatus.CHECKED_IN) {
            throw new InvalidOperationException("Booking has already been checked in");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new InvalidOperationException("Cancelled booking cannot be checked in");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new InvalidOperationException("Completed booking cannot be checked in");
        }

        if (booking.getStatus() != BookingStatus.PENDING_CHECK_IN) {
            throw new InvalidOperationException(
                    "Booking is not eligible for check-in in its current status: " + booking.getStatus());
        }
    }
}
