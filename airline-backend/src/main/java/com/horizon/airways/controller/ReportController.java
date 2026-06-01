package com.horizon.airways.controller;

import com.horizon.airways.dto.response.ApiResponse;
import com.horizon.airways.dto.response.ReportResponse;
import com.horizon.airways.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<ApiResponse<ReportResponse>> getFullReport() {
        ReportResponse report = reportService.getFullReport();
        return ResponseEntity.ok(ApiResponse.success(report, "Report generated successfully"));
    }
}
