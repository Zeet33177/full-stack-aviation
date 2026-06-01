package com.horizon.airways.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class DutyReportRequest {
    private Long employeeId;
    private String dutyArea;
    private LocalDate dutyDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String location;
    private String remarks;
}
