package com.horizon.airways.repository;

import com.horizon.airways.entity.DutyReport;
import com.horizon.airways.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DutyReportRepository extends JpaRepository<DutyReport, Long> {
    List<DutyReport> findByEmployee(Employee employee);
    List<DutyReport> findByDutyDate(LocalDate dutyDate);
    List<DutyReport> findByEmployeeOrderByDutyDateDesc(Employee employee);
}
