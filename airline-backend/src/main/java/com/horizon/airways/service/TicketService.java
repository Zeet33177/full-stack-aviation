package com.horizon.airways.service;

import com.horizon.airways.dto.response.TicketResponse;
import com.horizon.airways.entity.Booking;
import com.horizon.airways.entity.Ticket;
import com.horizon.airways.enums.BookingStatus;
import com.horizon.airways.exception.BookingException;
import com.horizon.airways.exception.ResourceNotFoundException;
import com.horizon.airways.repository.BookingRepository;
import com.horizon.airways.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public TicketResponse generateTicket(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!booking.getPassenger().getId().equals(userId)) {
            throw new BookingException("Unauthorized access to booking");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BookingException("Ticket can only be generated for confirmed bookings");
        }

        // Return existing ticket if already generated
        if (booking.getTicket() != null) {
            return toResponse(booking.getTicket());
        }

        LocalDateTime boardingTime = booking.getFlight().getDepartureTime().minusMinutes(45);

        Ticket ticket = Ticket.builder()
                .booking(booking)
                .ticketNumber(generateTicketNumber())
                .boardingGate(booking.getFlight().getGate() != null ? booking.getFlight().getGate() : "TBD")
                .boardingGroup(resolveBoardingGroup(booking.getSeatClass()))
                .boardingTime(boardingTime)
                .checkedIn(false)
                .build();

        ticket = ticketRepository.save(ticket);
        return toResponse(ticket);
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketByBookingId(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!booking.getPassenger().getId().equals(userId)) {
            throw new BookingException("Unauthorized access to booking");
        }

        Ticket ticket = ticketRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "bookingId", bookingId));

        return toResponse(ticket);
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketByNumber(String ticketNumber) {
        Ticket ticket = ticketRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "ticketNumber", ticketNumber));
        return toResponse(ticket);
    }

    private TicketResponse toResponse(Ticket t) {
        Booking b = t.getBooking();
        return TicketResponse.builder()
                .id(t.getId())
                .ticketNumber(t.getTicketNumber())
                .bookingReference(b.getBookingReference())
                .passengerName(b.getPassenger().getFirstName() + " " + b.getPassenger().getLastName())
                .passportNumber(b.getPassenger().getPassportNumber())
                .flightNumber(b.getFlight().getFlightNumber())
                .origin(b.getFlight().getOrigin())
                .destination(b.getFlight().getDestination())
                .departureTime(b.getFlight().getDepartureTime())
                .arrivalTime(b.getFlight().getArrivalTime())
                .terminal(b.getFlight().getTerminal())
                .gate(b.getFlight().getGate())
                .aircraftModel(b.getFlight().getAircraft() != null ? b.getFlight().getAircraft().getModel() : null)
                .seatNumber(b.getSeatNumber())
                .seatClass(b.getSeatClass())
                .mealPreference(b.getPassenger().getMealPreference())
                .issuedAt(t.getIssuedAt())
                .boardingTime(t.getBoardingTime())
                .boardingGate(t.getBoardingGate())
                .boardingGroup(t.getBoardingGroup())
                .checkedIn(t.isCheckedIn())
                .amount(b.getTotalAmount())
                .build();
    }

    private String generateTicketNumber() {
        return "TKT-HA-" + UUID.randomUUID().toString().toUpperCase().replace("-", "").substring(0, 10);
    }

    private String resolveBoardingGroup(String seatClass) {
        if (seatClass == null) return "C";
        return switch (seatClass.toUpperCase()) {
            case "FIRST" -> "A";
            case "BUSINESS" -> "B";
            default -> "C";
        };
    }
}
