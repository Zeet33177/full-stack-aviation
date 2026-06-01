package com.horizon.airways.service;

import com.horizon.airways.dto.response.FlightResponse;
import com.horizon.airways.entity.Flight;
import com.horizon.airways.enums.FlightStatus;
import com.horizon.airways.exception.ResourceNotFoundException;
import com.horizon.airways.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlightService {

    private final FlightRepository flightRepository;

    @Transactional(readOnly = true)
    public List<FlightResponse> searchFlights(String origin, String destination, LocalDate travelDate) {
        LocalDateTime startOfDay = travelDate.atStartOfDay();
        LocalDateTime endOfDay = travelDate.atTime(23, 59, 59);
        return flightRepository.searchFlights(origin, destination, startOfDay, endOfDay, FlightStatus.SCHEDULED)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FlightResponse> getAllFlights() {
        return flightRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FlightResponse getFlightById(Long id) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flight", "id", id));
        return toResponse(flight);
    }

    public FlightResponse toResponse(Flight flight) {
        long durationMinutes = ChronoUnit.MINUTES.between(flight.getDepartureTime(), flight.getArrivalTime());
        return FlightResponse.builder()
                .id(flight.getId())
                .flightNumber(flight.getFlightNumber())
                .origin(flight.getOrigin())
                .destination(flight.getDestination())
                .departureTime(flight.getDepartureTime())
                .arrivalTime(flight.getArrivalTime())
                .totalSeats(flight.getTotalSeats())
                .availableSeats(flight.getAvailableSeats())
                .price(flight.getPrice())
                .status(flight.getStatus().name())
                .terminal(flight.getTerminal())
                .gate(flight.getGate())
                .aircraftModel(flight.getAircraft() != null ? flight.getAircraft().getModel() : null)
                .aircraftRegistration(flight.getAircraft() != null ? flight.getAircraft().getRegistrationNumber() : null)
                .durationMinutes(durationMinutes)
                .build();
    }
}
