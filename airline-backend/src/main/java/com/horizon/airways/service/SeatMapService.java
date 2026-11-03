package com.horizon.airways.service;

import com.horizon.airways.dto.response.SeatMapResponse;
import com.horizon.airways.entity.Booking;
import com.horizon.airways.entity.Flight;
import com.horizon.airways.enums.BookingStatus;
import com.horizon.airways.exception.ResourceNotFoundException;
import com.horizon.airways.repository.BookingRepository;
import com.horizon.airways.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Owns the cabin layout, per-seat pricing, and occupancy. Used both by the
 * seat-map endpoint and at booking time so the price a passenger sees is the
 * price charged — the client never supplies the add-on amount.
 */
@Service
@RequiredArgsConstructor
public class SeatMapService {

    public static final int ROWS = 10;          // A .. J
    public static final int COLUMNS = 6;         // 1 .. 6
    public static final int AISLE_AFTER = 3;     // aisle between col 3 and 4

    private static final BigDecimal FREE    = BigDecimal.ZERO;
    private static final BigDecimal REGULAR = new BigDecimal("250");
    private static final BigDecimal PREMIUM = new BigDecimal("350");

    private final FlightRepository flightRepository;
    private final BookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public SeatMapResponse getSeatMap(Long flightId) {
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new ResourceNotFoundException("Flight", "id", flightId));

        Set<String> occupied = occupiedSeats(flightId);

        List<SeatMapResponse.SeatRow> rows = new ArrayList<>();
        for (int r = 0; r < ROWS; r++) {
            char rowLetter = (char) ('A' + r);
            List<SeatMapResponse.Seat> seats = new ArrayList<>();
            for (int c = 1; c <= COLUMNS; c++) {
                String number = "" + rowLetter + c;
                String type = seatType(rowLetter);
                seats.add(SeatMapResponse.Seat.builder()
                        .number(number)
                        .type(type)
                        .addOn(addOnForType(type))
                        .occupied(occupied.contains(number))
                        .build());
            }
            rows.add(SeatMapResponse.SeatRow.builder()
                    .row(String.valueOf(rowLetter))
                    .seats(seats)
                    .build());
        }

        return SeatMapResponse.builder()
                .flightId(flight.getId())
                .columns(COLUMNS)
                .aisleAfter(AISLE_AFTER)
                .rows(rows)
                .build();
    }

    /** Add-on for a specific seat, re-derived server-side at booking time. */
    public BigDecimal addOnForSeat(String seatNumber) {
        if (seatNumber == null || seatNumber.isBlank()) return FREE;
        return addOnForType(seatType(seatNumber.charAt(0)));
    }

    /** True if the seat exists in the layout and is not already taken. */
    public boolean isSeatAvailable(Long flightId, String seatNumber) {
        if (!isValidSeat(seatNumber)) return false;
        return !occupiedSeats(flightId).contains(seatNumber);
    }

    public boolean isValidSeat(String seatNumber) {
        if (seatNumber == null || seatNumber.length() < 2) return false;
        char row = seatNumber.charAt(0);
        if (row < 'A' || row >= 'A' + ROWS) return false;
        try {
            int col = Integer.parseInt(seatNumber.substring(1));
            return col >= 1 && col <= COLUMNS;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private Set<String> occupiedSeats(Long flightId) {
        Set<String> occupied = new HashSet<>();
        // Real, non-cancelled bookings on this flight.
        for (Booking b : bookingRepository.findByFlightIdAndStatusNot(flightId, BookingStatus.CANCELLED)) {
            if (b.getSeatNumber() != null) occupied.add(b.getSeatNumber());
        }
        // Demo-held seats: a stable scatter per flight so the map always shows
        // some seats taken even before any real booking exists.
        for (int r = 0; r < ROWS; r++) {
            char rowLetter = (char) ('A' + r);
            for (int c = 1; c <= COLUMNS; c++) {
                int seatIndex = r * COLUMNS + c;
                if ((flightId * 31 + seatIndex * 17L) % 7 == 0) {
                    occupied.add("" + rowLetter + c);
                }
            }
        }
        return occupied;
    }

    private String seatType(char rowLetter) {
        // Front rows and the exit row get extra legroom (premium).
        if (rowLetter == 'A' || rowLetter == 'B' || rowLetter == 'F') return "PREMIUM";
        // Back rows near the galley are free.
        if (rowLetter == 'I' || rowLetter == 'J') return "FREE";
        return "REGULAR";
    }

    private BigDecimal addOnForType(String type) {
        return switch (type) {
            case "PREMIUM" -> PREMIUM;
            case "FREE"    -> FREE;
            default        -> REGULAR;
        };
    }
}
