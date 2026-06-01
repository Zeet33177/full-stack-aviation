package com.horizon.airways.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;
    private LocalDate dateOfBirth;
    private String nationality;
    private String passportNumber;
    private String preferredSeat;
    private String mealPreference;
    private LocalDateTime createdAt;
    private int totalBookings;
}
