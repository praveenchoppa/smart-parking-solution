package com.smartparking.backend.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.smartparking.backend.payment.entity.Payment;
import com.smartparking.backend.payment.entity.PaymentMode;
import com.smartparking.backend.payment.entity.PaymentStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentResponse {

    private final Long id;
    private final Long bookingId;
    private final BigDecimal amount;
    private final PaymentMode paymentMode;
    private final PaymentStatus status;
    private final LocalDateTime paidAt;

    public static PaymentResponse fromEntity(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking().getId())
                .amount(payment.getAmount())
                .paymentMode(payment.getPaymentMode())
                .status(payment.getStatus())
                .paidAt(payment.getPaidAt())
                .build();
    }
}
