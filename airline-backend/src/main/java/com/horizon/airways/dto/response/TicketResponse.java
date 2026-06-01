package com.horizon.airways.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TicketResponse {
    private Long id;
    private String ticketNumber;
    private String bookingReference;

    // Passenger info
    private String passengerName;
    private String passportNumber;

    // Flight info
    private String flightNumber;
    private String origin;
    private String destination;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private String terminal;
    private String gate;
    private String aircraftModel;

    // Seat info
    private String seatNumber;
    private String seatClass;
    private String mealPreference;

    // Ticket meta
    private LocalDateTime issuedAt;
    private LocalDateTime boardingTime;
    private String boardingGate;
    private String boardingGroup;
    private boolean checkedIn;

    private BigDecimal amount;
}
