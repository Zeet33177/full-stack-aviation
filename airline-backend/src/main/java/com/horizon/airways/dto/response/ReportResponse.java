package com.horizon.airways.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ReportResponse {
    private String reportType;
    private String generatedAt;

    // ── Flight Report ──────────────────────────────────────
    private long totalFlights;
    private long scheduledFlights;
    private long delayedFlights;
    private long cancelledFlights;
    private long completedFlights;
    private Map<String, Long> topRoutes;

    // ── Reservation / Cancellation Report ─────────────────
    private long totalBookings;
    private long confirmedBookings;
    private long pendingBookings;
    private long cancelledBookings;
    private long completedBookings;
    private double cancellationRate;   // percentage

    // ── Revenue Report ─────────────────────────────────────
    private BigDecimal totalRevenue;
    private BigDecimal averageTicketPrice;

    // ── Aircraft Report ────────────────────────────────────
    private long totalAircraft;
    private long activeAircraft;
    private List<AircraftSummary> aircraftList;

    // ── Employee / Salary Report ───────────────────────────
    private long totalEmployees;
    private long activeEmployees;
    private BigDecimal totalSalaryPayroll;
    private BigDecimal averageSalary;
    private Map<String, Long>       employeesByDepartment;
    private Map<String, Long>       employeesByRole;
    private Map<String, BigDecimal> salaryByDepartment;
    private List<EmployeeSummary>   employeeList;

    // ── Attendance Report ──────────────────────────────────
    private long   totalAttendanceRecords;
    private long   presentCount;
    private long   absentCount;
    private long   leaveCount;
    private double attendanceRate;
    private long   totalDutyReports;

    // ── Nested DTOs ────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AircraftSummary {
        private Long   id;
        private String registrationNumber;
        private String model;
        private String manufacturer;
        private int    totalSeats;
        private int    economySeats;
        private int    businessSeats;
        private int    firstClassSeats;
        private int    yearOfManufacture;
        private String status;
        private long   assignedFlights;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class EmployeeSummary {
        private String     employeeId;
        private String     firstName;
        private String     lastName;
        private String     jobRole;
        private String     department;
        private String     email;
        private String     phone;
        private String     hireDate;
        private BigDecimal salary;
        private String     status;
    }
}
