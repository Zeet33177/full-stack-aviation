package com.horizon.airways.service;

import com.horizon.airways.dto.response.ReportResponse;
import com.horizon.airways.dto.response.ReportResponse.AircraftSummary;
import com.horizon.airways.dto.response.ReportResponse.EmployeeSummary;
import com.horizon.airways.enums.AttendanceStatus;
import com.horizon.airways.enums.BookingStatus;
import com.horizon.airways.enums.FlightStatus;
import com.horizon.airways.repository.AircraftRepository;
import com.horizon.airways.repository.AttendanceRepository;
import com.horizon.airways.repository.BookingRepository;
import com.horizon.airways.repository.DutyReportRepository;
import com.horizon.airways.repository.EmployeeRepository;
import com.horizon.airways.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final FlightRepository    flightRepository;
    private final BookingRepository   bookingRepository;
    private final AircraftRepository  aircraftRepository;
    private final EmployeeRepository  employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final DutyReportRepository dutyReportRepository;

    @Transactional(readOnly = true)
    public ReportResponse getFullReport() {
        String generatedAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"));

        // ── Flights ───────────────────────────────────────────
        long totalFlights     = flightRepository.count();
        long scheduledFlights = flightRepository.findByStatus(FlightStatus.SCHEDULED).size();
        long delayedFlights   = flightRepository.findByStatus(FlightStatus.DELAYED).size();
        long cancelledFlights = flightRepository.findByStatus(FlightStatus.CANCELLED).size();
        long completedFlights = flightRepository.findByStatus(FlightStatus.COMPLETED).size();
        Map<String, Long> topRoutes = buildTopRoutes();

        // ── Bookings ──────────────────────────────────────────
        long totalBookings     = bookingRepository.count();
        long confirmedBookings = bookingRepository.findByStatus(BookingStatus.CONFIRMED).size();
        long pendingBookings   = bookingRepository.findByStatus(BookingStatus.PENDING).size();
        long cancelledBookings = bookingRepository.findByStatus(BookingStatus.CANCELLED).size();
        long completedBookings = bookingRepository.findByStatus(BookingStatus.COMPLETED).size();
        double cancellationRate = totalBookings > 0
                ? Math.round(cancelledBookings * 1000.0 / totalBookings) / 10.0
                : 0.0;

        // ── Revenue ───────────────────────────────────────────
        LocalDateTime start = LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime end   = LocalDateTime.now();
        BigDecimal totalRevenue = bookingRepository.sumRevenueInRange(start, end);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        BigDecimal avgTicketPrice = confirmedBookings > 0
                ? totalRevenue.divide(BigDecimal.valueOf(confirmedBookings), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // ── Aircraft ──────────────────────────────────────────
        long totalAircraft  = aircraftRepository.count();
        long activeAircraft = aircraftRepository.findAll().stream()
                .filter(a -> "ACTIVE".equals(a.getStatus())).count();

        List<AircraftSummary> aircraftList = aircraftRepository.findAll().stream()
                .map(a -> {
                    long assignedFlights = flightRepository.findAll().stream()
                            .filter(f -> f.getAircraft() != null && f.getAircraft().getId().equals(a.getId()))
                            .count();
                    return AircraftSummary.builder()
                            .id(a.getId())
                            .registrationNumber(a.getRegistrationNumber())
                            .model(a.getModel())
                            .manufacturer(a.getManufacturer())
                            .totalSeats(a.getTotalSeats())
                            .economySeats(a.getEconomySeats())
                            .businessSeats(a.getBusinessSeats())
                            .firstClassSeats(a.getFirstClassSeats())
                            .yearOfManufacture(a.getYearOfManufacture())
                            .status(a.getStatus())
                            .assignedFlights(assignedFlights)
                            .build();
                })
                .collect(Collectors.toList());

        // ── Employees ─────────────────────────────────────────
        var allEmployees = employeeRepository.findAll();
        long totalEmployees  = allEmployees.size();
        long activeEmployees = allEmployees.stream()
                .filter(e -> "ACTIVE".equals(e.getStatus())).count();

        BigDecimal totalSalary = allEmployees.stream()
                .filter(e -> e.getSalary() != null)
                .map(e -> e.getSalary())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgSalary = totalEmployees > 0
                ? totalSalary.divide(BigDecimal.valueOf(totalEmployees), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Map<String, Long> employeesByDept = allEmployees.stream()
                .collect(Collectors.groupingBy(e -> e.getDepartment(), Collectors.counting()));

        Map<String, Long> employeesByRole = allEmployees.stream()
                .collect(Collectors.groupingBy(e -> e.getJobRole(), Collectors.counting()));

        Map<String, BigDecimal> salaryByDept = allEmployees.stream()
                .filter(e -> e.getSalary() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getDepartment(),
                        Collectors.reducing(BigDecimal.ZERO, e -> e.getSalary(), BigDecimal::add)
                ));

        List<EmployeeSummary> employeeList = allEmployees.stream()
                .map(e -> EmployeeSummary.builder()
                        .employeeId(e.getEmployeeId())
                        .firstName(e.getFirstName())
                        .lastName(e.getLastName())
                        .jobRole(e.getJobRole())
                        .department(e.getDepartment())
                        .email(e.getEmail())
                        .phone(e.getPhone())
                        .hireDate(e.getHireDate() != null ? e.getHireDate().toString() : "-")
                        .salary(e.getSalary())
                        .status(e.getStatus())
                        .build())
                .collect(Collectors.toList());

        // ── Attendance ────────────────────────────────────────
        var allAttendance = attendanceRepository.findAll();
        long totalAttendanceRecords = allAttendance.size();
        long presentCount = allAttendance.stream()
                .filter(a -> AttendanceStatus.PRESENT == a.getStatus()).count();
        long absentCount  = allAttendance.stream()
                .filter(a -> AttendanceStatus.ABSENT == a.getStatus()).count();
        long leaveCount   = allAttendance.stream()
                .filter(a -> AttendanceStatus.LEAVE == a.getStatus()
                          || AttendanceStatus.HALF_DAY == a.getStatus()).count();
        double attendanceRate = totalAttendanceRecords > 0
                ? Math.round(presentCount * 1000.0 / totalAttendanceRecords) / 10.0
                : 0.0;
        long totalDutyReports = dutyReportRepository.count();

        return ReportResponse.builder()
                .reportType("FULL_REPORT")
                .generatedAt(generatedAt)
                // flights
                .totalFlights(totalFlights)
                .scheduledFlights(scheduledFlights)
                .delayedFlights(delayedFlights)
                .cancelledFlights(cancelledFlights)
                .completedFlights(completedFlights)
                .topRoutes(topRoutes)
                // bookings
                .totalBookings(totalBookings)
                .confirmedBookings(confirmedBookings)
                .pendingBookings(pendingBookings)
                .cancelledBookings(cancelledBookings)
                .completedBookings(completedBookings)
                .cancellationRate(cancellationRate)
                // revenue
                .totalRevenue(totalRevenue)
                .averageTicketPrice(avgTicketPrice)
                // aircraft
                .totalAircraft(totalAircraft)
                .activeAircraft(activeAircraft)
                .aircraftList(aircraftList)
                // employees
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .totalSalaryPayroll(totalSalary)
                .averageSalary(avgSalary)
                .employeesByDepartment(employeesByDept)
                .employeesByRole(employeesByRole)
                .salaryByDepartment(salaryByDept)
                .employeeList(employeeList)
                // attendance
                .totalAttendanceRecords(totalAttendanceRecords)
                .presentCount(presentCount)
                .absentCount(absentCount)
                .leaveCount(leaveCount)
                .attendanceRate(attendanceRate)
                .totalDutyReports(totalDutyReports)
                .build();
    }

    private Map<String, Long> buildTopRoutes() {
        Map<String, Long> routes = new LinkedHashMap<>();
        flightRepository.findAll().forEach(f -> {
            String route = f.getOrigin() + " → " + f.getDestination();
            routes.merge(route, 1L, Long::sum);
        });
        return routes;
    }
}
