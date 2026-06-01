package com.horizon.airways.controller.admin;

import com.horizon.airways.dto.response.ApiResponse;
import com.horizon.airways.entity.CrewAssignment;
import com.horizon.airways.entity.Employee;
import com.horizon.airways.entity.Flight;
import com.horizon.airways.enums.CrewRole;
import com.horizon.airways.exception.ResourceNotFoundException;
import com.horizon.airways.repository.CrewAssignmentRepository;
import com.horizon.airways.repository.EmployeeRepository;
import com.horizon.airways.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/crew-schedule")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class CrewSchedulingController {

    private final CrewAssignmentRepository crewAssignmentRepository;
    private final FlightRepository flightRepository;
    private final EmployeeRepository employeeRepository;

    @GetMapping("/flight/{flightId}")
    public ResponseEntity<ApiResponse<List<CrewAssignment>>> getByFlight(@PathVariable Long flightId) {
        return ResponseEntity.ok(ApiResponse.success(
                crewAssignmentRepository.findByFlight_Id(flightId), "Crew for flight"));
    }

    @GetMapping("/employee/{empId}")
    public ResponseEntity<ApiResponse<List<CrewAssignment>>> getByEmployee(@PathVariable Long empId) {
        Employee emp = employeeRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", empId));
        return ResponseEntity.ok(ApiResponse.success(
                crewAssignmentRepository.findByEmployee(emp), "Flights for employee"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CrewAssignment>> assign(@RequestBody Map<String, Object> body) {
        Long flightId  = Long.valueOf(body.get("flightId").toString());
        Long empId     = Long.valueOf(body.get("employeeId").toString());
        CrewRole role  = CrewRole.valueOf(body.get("crewRole").toString());

        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new ResourceNotFoundException("Flight", "id", flightId));
        Employee emp = employeeRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", empId));

        if (crewAssignmentRepository.existsByFlightAndEmployee(flight, emp)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Employee is already assigned to this flight", Collections.emptyList()));
        }

        CrewAssignment assignment = CrewAssignment.builder()
                .flight(flight)
                .employee(emp)
                .crewRole(role)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(crewAssignmentRepository.save(assignment), "Crew assigned"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> unassign(@PathVariable Long id) {
        if (!crewAssignmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("CrewAssignment", "id", id);
        }
        crewAssignmentRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Crew unassigned"));
    }
}
