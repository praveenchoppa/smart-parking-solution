package com.smartparking.backend.payment.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.smartparking.backend.payment.dto.CreatePaymentRequest;
import com.smartparking.backend.payment.dto.PaymentResponse;
import com.smartparking.backend.payment.service.PaymentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/api/payments")
    public ResponseEntity<PaymentResponse> makeSimulatedPayment(
            @Valid @RequestBody CreatePaymentRequest request) {

        PaymentResponse response = paymentService.makeSimulatedPayment(request);

        URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/bookings/{bookingId}/payment")
                .buildAndExpand(response.getBookingId())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/api/bookings/{bookingId}/payment")
    public ResponseEntity<PaymentResponse> getPaymentByBookingId(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentByBookingId(bookingId));
    }
}
