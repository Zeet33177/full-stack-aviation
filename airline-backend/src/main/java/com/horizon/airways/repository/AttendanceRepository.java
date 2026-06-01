package com.horizon.airways.repository;

import com.horizon.airways.entity.Attendance;
import com.horizon.airways.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByDate(LocalDate date);
    List<Attendance> findByEmployee(Employee employee);
    Optional<Attendance> findByEmployeeAndDate(Employee employee, LocalDate date);
    List<Attendance> findByEmployeeOrderByDateDesc(Employee employee);
    long countByDate(LocalDate date);
}
