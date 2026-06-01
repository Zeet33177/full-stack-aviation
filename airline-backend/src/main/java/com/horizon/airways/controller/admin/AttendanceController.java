package com.horizon.airways.controller.admin;

import com.horizon.airways.dto.request.AttendanceRequest;
import com.horizon.airways.dto.response.ApiResponse;
import com.horizon.airways.entity.Attendance;
import com.horizon.airways.entity.Employee;
import com.horizon.airways.enums.AttendanceStatus;
import com.horizon.airways.exception.ResourceNotFoundException;
import com.horizon.airways.repository.AttendanceRepository;
import com.horizon.airways.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Collections;

@RestController
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    // ── Admin endpoints ──────────────────────────────────────────

    @GetMapping("/admin/attendance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Attendance>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(attendanceRepository.findAll(), "All attendance records"));
    }

    @GetMapping("/admin/attendance/date/{date}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Attendance>>> getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(attendanceRepository.findByDate(date), "Attendance for date"));
    }

    @GetMapping("/admin/attendance/employee/{empId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Attendance>>> getByEmployee(@PathVariable Long empId) {
        Employee emp = employeeRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", empId));
        return ResponseEntity.ok(ApiResponse.success(attendanceRepository.findByEmployee(emp), "Employee attendance"));
    }

    @PostMapping("/admin/attendance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Attendance>> adminMark(@RequestBody AttendanceRequest req) {
        Employee emp = employeeRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", req.getEmployeeId()));
        Attendance attendance = Attendance.builder()
                .employee(emp)
                .date(req.getDate() != null ? req.getDate() : LocalDate.now())
                .checkInTime(req.getCheckInTime())
                .checkOutTime(req.getCheckOutTime())
                .status(req.getStatus() != null ? req.getStatus() : AttendanceStatus.PRESENT)
                .notes(req.getNotes())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(attendanceRepository.save(attendance), "Attendance marked"));
    }

    // ── Staff endpoints ──────────────────────────────────────────

    @PostMapping("/staff/attendance/check-in")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<Attendance>> checkIn(Authentication auth) {
        Employee emp = employeeRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No employee profile is linked to your account. Ask admin to create an Employee with email: " + auth.getName()));
        LocalDate today = LocalDate.now();
        if (attendanceRepository.findByEmployeeAndDate(emp, today).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Already checked in today", Collections.emptyList()));
        }
        Attendance attendance = Attendance.builder()
                .employee(emp)
                .date(today)
                .checkInTime(LocalTime.now())
                .status(AttendanceStatus.PRESENT)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(attendanceRepository.save(attendance), "Checked in successfully"));
    }

    @PutMapping("/staff/attendance/check-out")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<Attendance>> checkOut(Authentication auth) {
        Employee emp = employeeRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No employee profile is linked to your account. Ask admin to create an Employee with email: " + auth.getName()));
        Attendance attendance = attendanceRepository.findByEmployeeAndDate(emp, LocalDate.now())
                .orElseThrow(() -> new ResourceNotFoundException("Attendance", "today", "no check-in found"));
        attendance.setCheckOutTime(LocalTime.now());
        return ResponseEntity.ok(ApiResponse.success(attendanceRepository.save(attendance), "Checked out successfully"));
    }

    @GetMapping("/staff/attendance/me")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<List<Attendance>>> getMyAttendance(Authentication auth) {
        return employeeRepository.findByEmail(auth.getName())
                .map(emp -> ResponseEntity.ok(
                        ApiResponse.success(attendanceRepository.findByEmployeeOrderByDateDesc(emp), "My attendance")))
                .orElseGet(() -> ResponseEntity.ok(
                        ApiResponse.success(List.of(), "NO_EMPLOYEE_LINKED")));
    }
}
