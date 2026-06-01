package com.horizon.airways.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "aircraft")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Aircraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String registrationNumber;

    @Column(nullable = false, length = 100)
    private String model;           // e.g. Boeing 737-800

    @Column(nullable = false, length = 100)
    private String manufacturer;    // e.g. Boeing

    @Column(nullable = false)
    private int totalSeats;

    private int economySeats;
    private int businessSeats;
    private int firstClassSeats;

    private int yearOfManufacture;

    @Column(length = 30)
    private String status;          // ACTIVE, MAINTENANCE, RETIRED
}
