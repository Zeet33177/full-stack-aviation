package com.horizon.airways.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String bookingReference;
    private Long passengerId;
    private String passengerName;
    private Long flightId;
    private String flightNumber;
    private String origin;
    private String destination;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private String seatNumber;
    private String seatClass;
    private String status;
    private BigDecimal totalAmount;
    private LocalDateTime bookingDate;
    private LocalDateTime cancellationDate;
    private boolean hasTicket;
}
