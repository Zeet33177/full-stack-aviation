package com.horizon.airways.controller;

import com.horizon.airways.dto.response.ApiResponse;
import com.horizon.airways.dto.response.FlightResponse;
import com.horizon.airways.service.FlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/flights")
@RequiredArgsConstructor
public class FlightController {

    private final FlightService flightService;

    // Public endpoint — no auth required
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<FlightResponse>>> searchFlights(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<FlightResponse> flights = flightService.searchFlights(origin, destination, date);
        return ResponseEntity.ok(ApiResponse.success(flights, "Flights retrieved successfully"));
    }

    // Public endpoint
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FlightResponse>> getFlightById(@PathVariable Long id) {
        FlightResponse flight = flightService.getFlightById(id);
        return ResponseEntity.ok(ApiResponse.success(flight, "Flight retrieved successfully"));
    }

    // Requires authentication
    @GetMapping
    public ResponseEntity<ApiResponse<List<FlightResponse>>> getAllFlights() {
        List<FlightResponse> flights = flightService.getAllFlights();
        return ResponseEntity.ok(ApiResponse.success(flights, "All flights retrieved"));
    }
}
