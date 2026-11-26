package com.horizon.airways.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PriceAlertResponse {
    private Long alertId;
    private FlightResponse flight;
    private BigDecimal trackedPrice;
    private BigDecimal currentPrice;
    private boolean dropped;
    private BigDecimal dropAmount;
    private boolean seen;
}
