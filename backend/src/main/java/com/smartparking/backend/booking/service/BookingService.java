package com.smartparking.backend.booking.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.smartparking.backend.booking.dto.BookingConfirmationResponse;
import com.smartparking.backend.booking.dto.BookingReceiptResponse;
import com.smartparking.backend.booking.dto.BookingResponse;
import com.smartparking.backend.booking.dto.CreateBookingRequest;
import com.smartparking.backend.booking.entity.Booking;
import com.smartparking.backend.booking.entity.BookingStatus;
import com.smartparking.backend.booking.repository.BookingRepository;
import com.smartparking.backend.common.exception.DuplicateResourceException;
import com.smartparking.backend.common.exception.InvalidOperationException;
import com.smartparking.backend.common.exception.ResourceConflictException;
import com.smartparking.backend.common.exception.ResourceNotFoundException;
import com.smartparking.backend.payment.entity.Payment;
import com.smartparking.backend.payment.entity.PaymentStatus;
import com.smartparking.backend.payment.repository.PaymentRepository;
import com.smartparking.backend.parkingarea.entity.ParkingArea;
import com.smartparking.backend.parkingarea.repository.ParkingAreaRepository;
import com.smartparking.backend.parkingslot.entity.ParkingSlot;
import com.smartparking.backend.parkingslot.entity.SlotStatus;
import com.smartparking.backend.parkingslot.repository.ParkingSlotRepository;
import com.smartparking.backend.user.entity.User;
import com.smartparking.backend.user.repository.UserRepository;
import com.smartparking.backend.vehicle.entity.Vehicle;
import com.smartparking.backend.vehicle.repository.VehicleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final EnumSet<BookingStatus> CANCELLABLE_STATUSES = EnumSet.of(
            BookingStatus.PENDING_PAYMENT,
            BookingStatus.PENDING_CHECK_IN);

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final ParkingAreaRepository parkingAreaRepository;
    private final ParkingSlotRepository parkingSlotRepository;

    public BookingResponse createBooking(CreateBookingRequest request) {
        User user = findUserOrThrow(request.getUserId());
        Vehicle vehicle = findVehicleForUserOrThrow(request.getUserId(), request.getVehicleId());
        ParkingArea parkingArea = findParkingAreaOrThrow(request.getParkingAreaId());
        ParkingSlot parkingSlot = findParkingSlotForAreaOrThrow(
                request.getParkingAreaId(),
                request.getParkingSlotId());

        if (parkingSlot.getStatus() != SlotStatus.AVAILABLE) {
            throw new ResourceConflictException("Parking slot is not available");
        }

        BigDecimal amount = calculateAmount(parkingArea.getHourlyRate(), request.getDurationHours());
        String bookingCode = generateUniqueBookingCode();

        parkingSlot.setStatus(SlotStatus.RESERVED);
        parkingSlotRepository.save(parkingSlot);

        Booking booking = Booking.builder()
                .user(user)
                .vehicle(vehicle)
                .parkingArea(parkingArea)
                .parkingSlot(parkingSlot)
                .bookingCode(bookingCode)
                .durationHours(request.getDurationHours())
                .amount(amount)
                .status(BookingStatus.PENDING_PAYMENT)
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        return BookingResponse.fromEntity(savedBooking);
    }

    public BookingResponse getBookingById(Long id) {
        Booking booking = findBookingOrThrow(id);
        return BookingResponse.fromEntity(booking);
    }

    public BookingConfirmationResponse getBookingConfirmation(Long id) {
        Booking booking = findBookingOrThrow(id);
        Payment payment = paymentRepository.findByBookingId(id).orElse(null);
        return BookingConfirmationResponse.from(booking, payment);
    }

    public List<BookingResponse> getBookingsByUserId(Long userId) {
        findUserOrThrow(userId);
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(booking -> {
                    Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
                    return BookingResponse.fromEntity(booking, payment);
                })
                .toList();
    }

    public BookingResponse completeBooking(Long id) {
        Booking booking = findBookingOrThrow(id);
        validateBookingEligibleForCompletion(booking);

        Payment payment = paymentRepository.findByBookingId(id)
                .orElseThrow(() -> new InvalidOperationException(
                        "Payment has not been completed for this booking"));

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new InvalidOperationException("Payment has not been completed for this booking");
        }

        ParkingSlot parkingSlot = parkingSlotRepository.findById(booking.getParkingSlot().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Parking slot", "id", booking.getParkingSlot().getId()));

        if (parkingSlot.getStatus() != SlotStatus.OCCUPIED) {
            throw new InvalidOperationException(
                    "Parking slot is not in the expected state for completion: " + parkingSlot.getStatus());
        }

        booking.setStatus(BookingStatus.COMPLETED);
        booking.setCompletedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        parkingSlot.setStatus(SlotStatus.AVAILABLE);
        parkingSlotRepository.save(parkingSlot);

        return BookingResponse.fromEntity(booking, payment);
    }

    public BookingReceiptResponse getBookingReceipt(Long id) {
        Booking booking = findBookingOrThrow(id);

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new InvalidOperationException("Receipt is only available for completed bookings");
        }

        Payment payment = paymentRepository.findByBookingId(id)
                .orElseThrow(() -> new InvalidOperationException(
                        "Payment information not found for this booking"));

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new InvalidOperationException(
                    "Receipt is only available for successfully paid bookings");
        }

        return BookingReceiptResponse.from(booking, payment);
    }

    public BookingResponse cancelBooking(Long id) {
        Booking booking = findBookingOrThrow(id);

        if (!CANCELLABLE_STATUSES.contains(booking.getStatus())) {
            throw new InvalidOperationException(
                    "Booking cannot be cancelled in its current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        ParkingSlot parkingSlot = parkingSlotRepository.findById(booking.getParkingSlot().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Parking slot", "id", booking.getParkingSlot().getId()));
        parkingSlot.setStatus(SlotStatus.AVAILABLE);
        parkingSlotRepository.save(parkingSlot);

        return BookingResponse.fromEntity(booking);
    }

    private BigDecimal calculateAmount(Double hourlyRate, Integer durationHours) {
        return BigDecimal.valueOf(hourlyRate)
                .multiply(BigDecimal.valueOf(durationHours))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private String generateUniqueBookingCode() {
        String bookingCode;
        int attempts = 0;

        do {
            bookingCode = "BK-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
            attempts++;
            if (attempts > 10) {
                throw new DuplicateResourceException("Booking", "bookingCode", bookingCode);
            }
        } while (bookingRepository.existsByBookingCode(bookingCode));

        return bookingCode;
    }

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    private Vehicle findVehicleForUserOrThrow(Long userId, Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new InvalidOperationException("Vehicle does not belong to the specified user");
        }

        return vehicle;
    }

    private ParkingArea findParkingAreaOrThrow(Long parkingAreaId) {
        return parkingAreaRepository.findById(parkingAreaId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking area", "id", parkingAreaId));
    }

    private ParkingSlot findParkingSlotForAreaOrThrow(Long parkingAreaId, Long parkingSlotId) {
        ParkingSlot parkingSlot = parkingSlotRepository.findById(parkingSlotId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot", "id", parkingSlotId));

        if (!parkingSlot.getParkingArea().getId().equals(parkingAreaId)) {
            throw new InvalidOperationException(
                    "Parking slot does not belong to the specified parking area");
        }

        return parkingSlot;
    }

    private Booking findBookingOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
    }

    private void validateBookingEligibleForCompletion(Booking booking) {
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new InvalidOperationException("Booking has already been completed");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new InvalidOperationException("Cancelled booking cannot be completed");
        }

        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new InvalidOperationException(
                    "Booking cannot be completed in its current status: " + booking.getStatus());
        }
    }
}
