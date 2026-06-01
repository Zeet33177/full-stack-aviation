package com.horizon.airways.service;

import com.horizon.airways.dto.request.BookingRequest;
import com.horizon.airways.dto.response.BookingResponse;
import com.horizon.airways.entity.Booking;
import com.horizon.airways.entity.Flight;
import com.horizon.airways.entity.User;
import com.horizon.airways.enums.BookingStatus;
import com.horizon.airways.exception.BookingException;
import com.horizon.airways.exception.ResourceNotFoundException;
import com.horizon.airways.repository.BookingRepository;
import com.horizon.airways.repository.FlightRepository;
import com.horizon.airways.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FlightRepository flightRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookingResponse createBooking(BookingRequest request, Long userId) {
        User passenger = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Flight flight = flightRepository.findById(request.getFlightId())
                .orElseThrow(() -> new ResourceNotFoundException("Flight", "id", request.getFlightId()));

        if (flight.getAvailableSeats() <= 0) {
            throw new BookingException("No seats available on flight " + flight.getFlightNumber());
        }

        if (bookingRepository.existsByPassengerIdAndFlightId(userId, flight.getId())) {
            throw new BookingException("You already have a booking on this flight");
        }

        int seatIndex = flight.getTotalSeats() - flight.getAvailableSeats() + 1;
        String seatNumber = assignSeat(seatIndex, request.getSeatClass());
        BigDecimal totalAmount = calculatePrice(flight.getPrice(), request.getSeatClass());

        Booking booking = Booking.builder()
                .bookingReference(generateBookingReference())
                .passenger(passenger)
                .flight(flight)
                .seatNumber(seatNumber)
                .seatClass(request.getSeatClass())
                .totalAmount(totalAmount)
                .build();

        booking = bookingRepository.save(booking);

        // Reserve the seat — decrement count
        flight.setAvailableSeats(flight.getAvailableSeats() - 1);
        flightRepository.save(flight);

        return toResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!booking.getPassenger().getId().equals(userId)) {
            throw new BookingException("You are not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BookingException("Booking is already cancelled");
        }

        if (booking.getFlight().getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new BookingException("Cannot cancel a booking for a past flight");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationDate(LocalDateTime.now());
        booking = bookingRepository.save(booking);

        // Release the seat
        Flight flight = booking.getFlight();
        flight.setAvailableSeats(flight.getAvailableSeats() + 1);
        flightRepository.save(flight);

        return toResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByUser(Long userId) {
        return bookingRepository.findByPassengerIdOrderByBookingDateDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingByReference(String reference) {
        Booking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "reference", reference));
        return toResponse(booking);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        return toResponse(booking);
    }

    public BookingResponse toResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .bookingReference(b.getBookingReference())
                .passengerId(b.getPassenger().getId())
                .passengerName(b.getPassenger().getFirstName() + " " + b.getPassenger().getLastName())
                .flightId(b.getFlight().getId())
                .flightNumber(b.getFlight().getFlightNumber())
                .origin(b.getFlight().getOrigin())
                .destination(b.getFlight().getDestination())
                .departureTime(b.getFlight().getDepartureTime())
                .arrivalTime(b.getFlight().getArrivalTime())
                .seatNumber(b.getSeatNumber())
                .seatClass(b.getSeatClass())
                .status(b.getStatus().name())
                .totalAmount(b.getTotalAmount())
                .bookingDate(b.getBookingDate())
                .cancellationDate(b.getCancellationDate())
                .hasTicket(b.getTicket() != null)
                .build();
    }

    private BigDecimal calculatePrice(BigDecimal basePrice, String seatClass) {
        return switch (seatClass) {
            case "BUSINESS" -> basePrice.multiply(new BigDecimal("2.0"));
            case "FIRST"    -> basePrice.multiply(new BigDecimal("3.0"));
            default         -> basePrice;
        };
    }

    private String generateBookingReference() {
        return "HA" + UUID.randomUUID().toString().toUpperCase().replace("-", "").substring(0, 8);
    }

    private String assignSeat(int index, String seatClass) {
        char row = (char) ('A' + ((index - 1) / 6));
        int col = ((index - 1) % 6) + 1;
        return String.valueOf(row) + col;
    }
}
