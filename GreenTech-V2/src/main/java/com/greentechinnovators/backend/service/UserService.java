package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.user.UpdateProfileRequestDTO;
import com.greentechinnovators.backend.dto.user.UserProfileDTO;
import com.greentechinnovators.backend.entity.User;
import com.greentechinnovators.backend.gamification.domain.UserGamificationStats;
import com.greentechinnovators.backend.gamification.repository.GamificationStatsRepository;
import com.greentechinnovators.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final GamificationStatsRepository gamificationStatsRepository;


    public List<UserProfileDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToProfileDTO)
                .collect(Collectors.toList());
    }


    public UserProfileDTO getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return mapToProfileDTO(user);
    }


    public UserProfileDTO getUserProfile(String userId) {
        return getUserById(userId);
    }


    @Transactional
    public UserProfileDTO updateUserProfile(String userId, UpdateProfileRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Update fields if provided
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            // Check if email is already taken by another user
            userRepository.findByEmail(request.getEmail())
                    .ifPresent(existingUser -> {
                        if (!existingUser.getId().equals(userId)) {
                            throw new RuntimeException("Email is already in use");
                        }
                    });
            user.setEmail(request.getEmail());
        }
        
        if (request.getProfilePicture() != null) {
            user.setProfilePicture(request.getProfilePicture());
        }

        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        
        return mapToProfileDTO(updatedUser);
    }


    @Transactional
    public void deleteUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Delete user's gamification stats
        gamificationStatsRepository.findByUserId(userId)
                .ifPresent(gamificationStatsRepository::delete);
        
        // Delete user
        userRepository.delete(user);
    }


    private UserProfileDTO mapToProfileDTO(User user) {
        // Get gamification stats if available
        UserGamificationStats stats = gamificationStatsRepository.findByUserId(user.getId())
                .orElse(null);

        int rank = 0;
        if (stats != null) {
            rank = (int) gamificationStatsRepository.countByTotalPointsGreaterThan(stats.getTotalPoints()) + 1;
        }

        return UserProfileDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .profilePicture(user.getProfilePicture())
                .totalPoints(stats != null ? stats.getTotalPoints() : 0)
                .currentLevel(stats != null ? stats.getCurrentLevel() : 1)
                .rank(rank)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
