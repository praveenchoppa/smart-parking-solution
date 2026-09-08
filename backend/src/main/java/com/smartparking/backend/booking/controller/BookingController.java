package com.smartparking.backend.booking.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.smartparking.backend.booking.dto.BookingConfirmationResponse;
import com.smartparking.backend.booking.dto.BookingReceiptResponse;
import com.smartparking.backend.booking.dto.BookingResponse;
import com.smartparking.backend.booking.dto.CreateBookingRequest;
import com.smartparking.backend.booking.service.BookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/api/bookings")
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);

        URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/bookings/{id}")
                .buildAndExpand(response.getId())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/api/bookings/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/api/bookings/{id}/confirmation")
    public ResponseEntity<BookingConfirmationResponse> getBookingConfirmation(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingConfirmation(id));
    }

    @GetMapping("/api/users/{userId}/bookings")
    public ResponseEntity<List<BookingResponse>> getBookingsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
    }

    @PutMapping("/api/bookings/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    @PutMapping("/api/bookings/{id}/complete")
    public ResponseEntity<BookingResponse> completeBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.completeBooking(id));
    }

    @GetMapping("/api/bookings/{id}/receipt")
    public ResponseEntity<BookingReceiptResponse> getBookingReceipt(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingReceipt(id));
    }
}
