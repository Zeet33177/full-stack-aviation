package com.horizon.airways.service;

import com.horizon.airways.dto.request.ProfileUpdateRequest;
import com.horizon.airways.dto.response.UserProfileResponse;
import com.horizon.airways.entity.User;
import com.horizon.airways.exception.ResourceNotFoundException;
import com.horizon.airways.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return toResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getNationality() != null) user.setNationality(request.getNationality());
        if (request.getPassportNumber() != null) user.setPassportNumber(request.getPassportNumber());
        if (request.getPreferredSeat() != null) user.setPreferredSeat(request.getPreferredSeat());
        if (request.getMealPreference() != null) user.setMealPreference(request.getMealPreference());

        user = userRepository.save(user);
        return toResponse(user);
    }

    private UserProfileResponse toResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .dateOfBirth(user.getDateOfBirth())
                .nationality(user.getNationality())
                .passportNumber(user.getPassportNumber())
                .preferredSeat(user.getPreferredSeat())
                .mealPreference(user.getMealPreference())
                .createdAt(user.getCreatedAt())
                .totalBookings(user.getBookings().size())
                .build();
    }
}
