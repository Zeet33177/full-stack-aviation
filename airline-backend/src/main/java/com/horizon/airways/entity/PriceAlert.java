package com.horizon.airways.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_alerts", uniqueConstraints = @UniqueConstraint(
        name = "uk_user_flight_alert", columnNames = {"user_id", "flight_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PriceAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_id", nullable = false)
    private Flight flight;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal trackedPrice;

    @Builder.Default
    @Column(nullable = false)
    private boolean seen = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
