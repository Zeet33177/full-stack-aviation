package com.horizon.airways.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees", uniqueConstraints = @UniqueConstraint(columnNames = "employeeId"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String employeeId;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, length = 50)
    private String jobRole;         // PILOT, CO_PILOT, FLIGHT_ATTENDANT, GROUND_STAFF

    @Column(nullable = false, length = 50)
    private String department;      // FLIGHT_OPERATIONS, GROUND_OPERATIONS, MAINTENANCE

    @Column(nullable = false, unique = true)
    private String email;

    @Column(length = 20)
    private String phone;

    private LocalDate hireDate;

    @Column(precision = 10, scale = 2)
    private BigDecimal salary;

    @Column(length = 30)
    private String status;          // ACTIVE, ON_LEAVE, TERMINATED

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
