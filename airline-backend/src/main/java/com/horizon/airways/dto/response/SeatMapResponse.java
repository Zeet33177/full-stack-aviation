package com.horizon.airways.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatMapResponse {

    private Long flightId;
    private int columns;        // seats per row
    private int aisleAfter;     // aisle rendered after this column (1-based)
    private List<SeatRow> rows;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatRow {
        private String row;         // "A", "B", ...
        private List<Seat> seats;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Seat {
        private String number;      // "A1"
        private String type;        // FREE, REGULAR, PREMIUM
        private BigDecimal addOn;    // price added on top of class fare
        private boolean occupied;
    }
}
