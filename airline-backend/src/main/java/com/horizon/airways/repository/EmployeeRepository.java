package com.horizon.airways.repository;

import com.horizon.airways.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmployeeId(String employeeId);
    Optional<Employee> findByEmail(String email);
    List<Employee> findByDepartment(String department);
    boolean existsByEmail(String email);
    boolean existsByEmployeeId(String employeeId);
}
