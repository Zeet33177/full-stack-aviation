package com.horizon.airways.controller;

import com.horizon.airways.dto.response.ApiResponse;
import com.horizon.airways.dto.response.TicketResponse;
import com.horizon.airways.repository.UserRepository;
import com.horizon.airways.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final UserRepository userRepository;

    @PostMapping("/booking/{bookingId}/generate")
    public ResponseEntity<ApiResponse<TicketResponse>> generateTicket(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        TicketResponse ticket = ticketService.generateTicket(bookingId, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(ticket, "Ticket generated successfully"));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicketByBooking(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        TicketResponse ticket = ticketService.getTicketByBookingId(bookingId, userId);
        return ResponseEntity.ok(ApiResponse.success(ticket, "Ticket retrieved successfully"));
    }

    @GetMapping("/{ticketNumber}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicketByNumber(@PathVariable String ticketNumber) {
        TicketResponse ticket = ticketService.getTicketByNumber(ticketNumber);
        return ResponseEntity.ok(ApiResponse.success(ticket, "Ticket retrieved successfully"));
    }

    private Long resolveUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"))
                .getId();
    }
}
