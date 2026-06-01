package com.horizon.airways.controller.admin;

import com.horizon.airways.dto.response.ApiResponse;
import com.horizon.airways.entity.Aircraft;
import com.horizon.airways.exception.ResourceNotFoundException;
import com.horizon.airways.repository.AircraftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/aircraft")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminAircraftController {

    private final AircraftRepository aircraftRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Aircraft>>> getAllAircraft() {
        return ResponseEntity.ok(ApiResponse.success(aircraftRepository.findAll(), "Aircraft retrieved"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Aircraft>> createAircraft(@RequestBody Aircraft aircraft) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(aircraftRepository.save(aircraft), "Aircraft created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Aircraft>> updateAircraft(@PathVariable Long id,
                                                                @RequestBody Aircraft updated) {
        aircraftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aircraft", "id", id));
        updated.setId(id);
        return ResponseEntity.ok(ApiResponse.success(aircraftRepository.save(updated), "Aircraft updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAircraft(@PathVariable Long id) {
        if (!aircraftRepository.existsById(id)) throw new ResourceNotFoundException("Aircraft", "id", id);
        aircraftRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Aircraft deleted"));
    }
}
