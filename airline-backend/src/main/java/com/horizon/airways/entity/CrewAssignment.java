package com.horizon.airways.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.horizon.airways.enums.CrewRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "crew_assignments",
    uniqueConstraints = @UniqueConstraint(columnNames = {"flight_id", "employee_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrewAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnoreProperties({"bookings", "aircraft", "hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "flight_id", nullable = false)
    private Flight flight;

    @JsonIgnoreProperties({"bookings", "hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CrewRole crewRole;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime assignedAt;
}
