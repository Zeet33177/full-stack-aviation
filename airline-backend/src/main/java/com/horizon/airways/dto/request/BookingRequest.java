package com.horizon.airways.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class BookingRequest {

    @NotNull(message = "Flight ID is required")
    @Positive(message = "Flight ID must be positive")
    private Long flightId;

    @NotBlank(message = "Seat class is required")
    private String seatClass;   // ECONOMY, BUSINESS, FIRST

    private String seatNumber;  // optional; chosen from the seat map
}
