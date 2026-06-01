package com.horizon.airways.repository;

import com.horizon.airways.entity.CrewAssignment;
import com.horizon.airways.entity.Employee;
import com.horizon.airways.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CrewAssignmentRepository extends JpaRepository<CrewAssignment, Long> {
    List<CrewAssignment> findByFlight(Flight flight);
    List<CrewAssignment> findByEmployee(Employee employee);
    List<CrewAssignment> findByFlight_Id(Long flightId);
    boolean existsByFlightAndEmployee(Flight flight, Employee employee);
}
