package com.horizon.airways.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "duty_reports")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DutyReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false, length = 100)
    private String dutyArea;

    @Column(nullable = false)
    private LocalDate dutyDate;

    private LocalTime startTime;

    private LocalTime endTime;

    @Column(length = 100)
    private String location;

    @Column(length = 500)
    private String remarks;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
