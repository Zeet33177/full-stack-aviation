package com.horizon.airways.controller;

import com.horizon.airways.dto.response.ApiResponse;
import com.horizon.airways.dto.response.SeatMapResponse;
import com.horizon.airways.service.SeatMapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/flights")
@RequiredArgsConstructor
public class SeatController {

    private final SeatMapService seatMapService;

    @GetMapping("/{flightId}/seatmap")
    public ResponseEntity<ApiResponse<SeatMapResponse>> getSeatMap(@PathVariable Long flightId) {
        SeatMapResponse seatMap = seatMapService.getSeatMap(flightId);
        return ResponseEntity.ok(ApiResponse.success(seatMap, "Seat map retrieved successfully"));
    }
}
