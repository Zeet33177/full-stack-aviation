package com.horizon.airways.controller.admin;

import com.horizon.airways.dto.response.ApiResponse;
import com.horizon.airways.dto.response.FlightResponse;
import com.horizon.airways.entity.Aircraft;
import com.horizon.airways.entity.Flight;
import com.horizon.airways.enums.FlightStatus;
import com.horizon.airways.exception.ResourceNotFoundException;
import com.horizon.airways.repository.AircraftRepository;
import com.horizon.airways.repository.FlightRepository;
import com.horizon.airways.service.FlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/flights")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminFlightController {

    private final FlightRepository flightRepository;
    private final AircraftRepository aircraftRepository;
    private final FlightService flightService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FlightResponse>>> getAllFlights() {
        List<FlightResponse> flights = flightRepository.findAll()
                .stream().map(flightService::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(flights, "All flights"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FlightResponse>> createFlight(@RequestBody Map<String, Object> body) {
        Long aircraftId = Long.valueOf(body.get("aircraftId").toString());
        Aircraft aircraft = aircraftRepository.findById(aircraftId)
                .orElseThrow(() -> new ResourceNotFoundException("Aircraft", "id", aircraftId));

        Flight flight = Flight.builder()
                .flightNumber(body.get("flightNumber").toString())
                .aircraft(aircraft)
                .origin(body.get("origin").toString())
                .destination(body.get("destination").toString())
                .departureTime(LocalDateTime.parse(body.get("departureTime").toString()))
                .arrivalTime(LocalDateTime.parse(body.get("arrivalTime").toString()))
                .totalSeats(Integer.parseInt(body.get("totalSeats").toString()))
                .availableSeats(Integer.parseInt(body.get("totalSeats").toString()))
                .price(new BigDecimal(body.get("price").toString()))
                .terminal(body.getOrDefault("terminal", "T1").toString())
                .gate(body.getOrDefault("gate", "G1").toString())
                .build();

        flight = flightRepository.save(flight);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(flightService.toResponse(flight), "Flight created"));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<FlightResponse>> cancelFlight(@PathVariable Long id) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flight", "id", id));
        flight.setStatus(FlightStatus.CANCELLED);
        flight = flightRepository.save(flight);
        return ResponseEntity.ok(ApiResponse.success(flightService.toResponse(flight), "Flight cancelled"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFlight(@PathVariable Long id) {
        if (!flightRepository.existsById(id)) {
            throw new ResourceNotFoundException("Flight", "id", id);
        }
        flightRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Flight deleted"));
    }
}
