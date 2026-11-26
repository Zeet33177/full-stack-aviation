package com.horizon.airways.service;

import com.horizon.airways.dto.response.PriceAlertResponse;
import com.horizon.airways.entity.Flight;
import com.horizon.airways.entity.PriceAlert;
import com.horizon.airways.entity.User;
import com.horizon.airways.exception.ResourceNotFoundException;
import com.horizon.airways.repository.FlightRepository;
import com.horizon.airways.repository.PriceAlertRepository;
import com.horizon.airways.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PriceAlertService {

    private final PriceAlertRepository priceAlertRepository;
    private final FlightRepository flightRepository;
    private final UserRepository userRepository;
    private final FlightService flightService;

    @Transactional
    public void track(Long userId, Long flightId) {
        if (priceAlertRepository.existsByUserIdAndFlightId(userId, flightId)) {
            return;
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new ResourceNotFoundException("Flight", "id", flightId));

        PriceAlert alert = PriceAlert.builder()
                .user(user)
                .flight(flight)
                .trackedPrice(flight.getPrice())
                .seen(false)
                .build();
        priceAlertRepository.save(alert);
    }

    @Transactional
    public void untrack(Long userId, Long flightId) {
        priceAlertRepository.deleteByUserIdAndFlightId(userId, flightId);
    }

    @Transactional(readOnly = true)
    public List<PriceAlertResponse> getMyAlerts(Long userId) {
        return priceAlertRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long unseenDropCount(Long userId) {
        return priceAlertRepository.findByUserId(userId).stream()
                .filter(a -> !a.isSeen()
                        && a.getFlight().getPrice().compareTo(a.getTrackedPrice()) < 0)
                .count();
    }

    @Transactional
    public void markAllSeen(Long userId) {
        List<PriceAlert> alerts = priceAlertRepository.findByUserId(userId);
        alerts.forEach(a -> a.setSeen(true));
        priceAlertRepository.saveAll(alerts);
    }

    /** Called when an admin changes a flight's price: re-arm notifications on genuine drops. */
    @Transactional
    public void onFlightPriceChanged(Long flightId, BigDecimal newPrice) {
        List<PriceAlert> alerts = priceAlertRepository.findByFlightId(flightId);
        alerts.stream()
                .filter(a -> newPrice.compareTo(a.getTrackedPrice()) < 0)
                .forEach(a -> a.setSeen(false));
        priceAlertRepository.saveAll(alerts);
    }

    private PriceAlertResponse toResponse(PriceAlert alert) {
        Flight flight = alert.getFlight();
        BigDecimal current = flight.getPrice();
        BigDecimal tracked = alert.getTrackedPrice();
        boolean dropped = current.compareTo(tracked) < 0;
        BigDecimal dropAmount = dropped ? tracked.subtract(current) : BigDecimal.ZERO;
        return PriceAlertResponse.builder()
                .alertId(alert.getId())
                .flight(flightService.toResponse(flight))
                .trackedPrice(tracked)
                .currentPrice(current)
                .dropped(dropped)
                .dropAmount(dropAmount)
                .seen(alert.isSeen())
                .build();
    }
}
