package com.horizon.airways.repository;

import com.horizon.airways.entity.Flight;
import com.horizon.airways.enums.FlightStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {

    Optional<Flight> findByFlightNumber(String flightNumber);

    @Query("""
            SELECT f FROM Flight f
            WHERE LOWER(f.origin) = LOWER(:origin)
              AND LOWER(f.destination) = LOWER(:destination)
              AND f.departureTime >= :startOfDay
              AND f.departureTime < :endOfDay
              AND f.status = :status
              AND f.availableSeats > 0
            """)
    List<Flight> searchFlights(
            @Param("origin") String origin,
            @Param("destination") String destination,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay,
            @Param("status") FlightStatus status
    );

    List<Flight> findByStatus(FlightStatus status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.flight.id = :flightId AND b.status = 'CONFIRMED'")
    long countConfirmedBookings(@Param("flightId") Long flightId);
}
