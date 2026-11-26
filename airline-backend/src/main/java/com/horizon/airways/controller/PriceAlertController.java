package com.horizon.airways.controller;

import com.horizon.airways.dto.response.ApiResponse;
import com.horizon.airways.dto.response.PriceAlertResponse;
import com.horizon.airways.repository.UserRepository;
import com.horizon.airways.service.PriceAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tracks")
@RequiredArgsConstructor
public class PriceAlertController {

    private final PriceAlertService priceAlertService;
    private final UserRepository userRepository;

    @PostMapping("/{flightId}")
    public ResponseEntity<ApiResponse<Void>> track(
            @PathVariable Long flightId,
            @AuthenticationPrincipal UserDetails userDetails) {
        priceAlertService.track(resolveUserId(userDetails), flightId);
        return ResponseEntity.ok(ApiResponse.success(null, "Tracking price for this flight"));
    }

    @DeleteMapping("/{flightId}")
    public ResponseEntity<ApiResponse<Void>> untrack(
            @PathVariable Long flightId,
            @AuthenticationPrincipal UserDetails userDetails) {
        priceAlertService.untrack(resolveUserId(userDetails), flightId);
        return ResponseEntity.ok(ApiResponse.success(null, "Stopped tracking this flight"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PriceAlertResponse>>> getMyAlerts(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<PriceAlertResponse> alerts = priceAlertService.getMyAlerts(resolveUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success(alerts, "Tracked flights retrieved"));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<Map<String, Long>>> notifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        long count = priceAlertService.unseenDropCount(resolveUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count), "Unseen price drops"));
    }

    @PutMapping("/seen")
    public ResponseEntity<ApiResponse<Void>> markSeen(
            @AuthenticationPrincipal UserDetails userDetails) {
        priceAlertService.markAllSeen(resolveUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success(null, "Notifications marked as seen"));
    }

    private Long resolveUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"))
                .getId();
    }
}
