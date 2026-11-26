package com.horizon.airways.repository;

import com.horizon.airways.entity.PriceAlert;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PriceAlertRepository extends JpaRepository<PriceAlert, Long> {

    List<PriceAlert> findByUserId(Long userId);

    Optional<PriceAlert> findByUserIdAndFlightId(Long userId, Long flightId);

    List<PriceAlert> findByFlightId(Long flightId);

    boolean existsByUserIdAndFlightId(Long userId, Long flightId);

    @Modifying
    @Transactional
    void deleteByUserIdAndFlightId(Long userId, Long flightId);
}
