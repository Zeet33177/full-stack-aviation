package com.horizon.airways.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long bookingId;
    private String bookingReference;
    private String maskedCardNumber;
    private String cardHolderName;
    private BigDecimal amount;
    private LocalDateTime paymentDate;
    private String status;
    private String transactionId;
    private String paymentMethod;
}
