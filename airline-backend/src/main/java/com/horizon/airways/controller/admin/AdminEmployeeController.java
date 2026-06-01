package com.horizon.airways.controller.admin;

import com.horizon.airways.dto.response.ApiResponse;
import com.horizon.airways.entity.Employee;
import com.horizon.airways.exception.ResourceNotFoundException;
import com.horizon.airways.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/employees")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminEmployeeController {

    private final EmployeeRepository employeeRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Employee>>> getAllEmployees() {
        return ResponseEntity.ok(ApiResponse.success(employeeRepository.findAll(), "Employees retrieved"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Employee>> getEmployee(@PathVariable Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return ResponseEntity.ok(ApiResponse.success(emp, "Employee retrieved"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Employee>> createEmployee(@RequestBody Employee employee) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(employeeRepository.save(employee), "Employee created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Employee>> updateEmployee(@PathVariable Long id,
                                                                @RequestBody Employee updated) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        updated.setId(emp.getId());
        return ResponseEntity.ok(ApiResponse.success(employeeRepository.save(updated), "Employee updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable Long id) {
        if (!employeeRepository.existsById(id)) throw new ResourceNotFoundException("Employee", "id", id);
        employeeRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Employee deleted"));
    }
}
