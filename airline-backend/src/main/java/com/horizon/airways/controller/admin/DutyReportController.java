package com.horizon.airways.controller.admin;

import com.horizon.airways.dto.request.DutyReportRequest;
import com.horizon.airways.dto.response.ApiResponse;
import com.horizon.airways.entity.DutyReport;
import com.horizon.airways.entity.Employee;
import com.horizon.airways.exception.ResourceNotFoundException;
import com.horizon.airways.repository.DutyReportRepository;
import com.horizon.airways.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DutyReportController {

    private final DutyReportRepository dutyReportRepository;
    private final EmployeeRepository employeeRepository;

    // ── Admin endpoints ──────────────────────────────────────────

    @GetMapping("/admin/duty-reports")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<DutyReport>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(dutyReportRepository.findAll(), "All duty reports"));
    }

    @GetMapping("/admin/duty-reports/employee/{empId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<DutyReport>>> getByEmployee(@PathVariable Long empId) {
        Employee emp = employeeRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", empId));
        return ResponseEntity.ok(ApiResponse.success(
                dutyReportRepository.findByEmployeeOrderByDutyDateDesc(emp), "Duty reports for employee"));
    }

    @PostMapping("/admin/duty-reports")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DutyReport>> adminCreate(@RequestBody DutyReportRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saveDutyReport(req), "Duty report created"));
    }

    // ── Staff endpoints ──────────────────────────────────────────

    @PostMapping("/staff/duty-reports")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<DutyReport>> staffSubmit(@RequestBody DutyReportRequest req,
                                                               Authentication auth) {
        Employee emp = employeeRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No employee profile is linked to your account. Ask admin to create an Employee with email: " + auth.getName()));
        req.setEmployeeId(emp.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saveDutyReport(req), "Duty report submitted"));
    }

    @GetMapping("/staff/duty-reports/me")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<List<DutyReport>>> getMyReports(Authentication auth) {
        return employeeRepository.findByEmail(auth.getName())
                .map(emp -> ResponseEntity.ok(
                        ApiResponse.success(dutyReportRepository.findByEmployeeOrderByDutyDateDesc(emp), "My duty reports")))
                .orElseGet(() -> ResponseEntity.ok(
                        ApiResponse.success(List.of(), "NO_EMPLOYEE_LINKED")));
    }

    private DutyReport saveDutyReport(DutyReportRequest req) {
        Employee emp = employeeRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", req.getEmployeeId()));
        DutyReport report = DutyReport.builder()
                .employee(emp)
                .dutyArea(req.getDutyArea())
                .dutyDate(req.getDutyDate())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .location(req.getLocation())
                .remarks(req.getRemarks())
                .build();
        return dutyReportRepository.save(report);
    }
}
