package com.horizon.airways.repository;

import com.horizon.airways.entity.Booking;
import com.horizon.airways.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String bookingReference);

    List<Booking> findByPassengerIdOrderByBookingDateDesc(Long passengerId);

    List<Booking> findByStatus(BookingStatus status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status AND b.bookingDate BETWEEN :start AND :end")
    long countByStatusAndDateRange(
            @Param("status") BookingStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("SELECT SUM(b.totalAmount) FROM Booking b WHERE b.status = 'CONFIRMED' AND b.bookingDate BETWEEN :start AND :end")
    java.math.BigDecimal sumRevenueInRange(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    boolean existsByPassengerIdAndFlightId(Long passengerId, Long flightId);
}
