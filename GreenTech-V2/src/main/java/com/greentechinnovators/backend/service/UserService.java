package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.user.CreateUserRequestDTO;
import com.greentechinnovators.backend.dto.user.UpdateProfileRequestDTO;
import com.greentechinnovators.backend.dto.user.UserProfileDTO;
import com.greentechinnovators.backend.entity.Department;
import com.greentechinnovators.backend.entity.User;
import com.greentechinnovators.backend.entity.gamification.UserGamificationStats;
import com.greentechinnovators.backend.repository.gamification.GamificationStatsRepository;
import com.greentechinnovators.backend.repository.DepartmentRepository;
import com.greentechinnovators.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final GamificationStatsRepository gamificationStatsRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final DepartmentRepository departmentRepository;
    public List<UserProfileDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToProfileDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserProfileDTO createUser(CreateUserRequestDTO request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already in use");
        }

        int randompassword = 100 + (int)(Math.random() * 1000);
        String password = "GreenTech"+ randompassword ;
        String generatedPassword = passwordEncoder.encode(password);

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(generatedPassword)
                .role(request.getRole())
                .department(request.getDepartment())
                .jobTitle(request.getJobTitle())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();


        User savedUser = userRepository.save(user);

        if (request.getDepartment() != null && !request.getDepartment().isEmpty()) {

            Department dept = departmentRepository.findByName(request.getDepartment())
                    .orElseGet(() -> {
                        Department newDept = Department.builder()
                                .name(request.getDepartment())
                                .users(new ArrayList<>())
                                .build();
                        return departmentRepository.save(newDept);
                    });

            if (dept.getUsers() == null) {
                dept.setUsers(new ArrayList<>());
            }
            dept.getUsers().add(savedUser);

            departmentRepository.save(dept);
        }
        emailService.sendAccountCreatedEmail(
                request.getEmail(),
                request.getName(),
                password
        );
        // Create initial gamification stats
        UserGamificationStats stats = UserGamificationStats.builder()
                .userId(savedUser.getId())
                .totalPoints(0)
                .currentLevel(1)
                .totalActions(0)
                .totalChallenges(0)
                .build();
        gamificationStatsRepository.save(stats);

        return mapToProfileDTO(savedUser);
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
        
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment());
        }
        
        if (request.getJobTitle() != null) {
            user.setJobTitle(request.getJobTitle());
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
                .department(user.getDepartment())
                .jobTitle(user.getJobTitle())
                .profilePicture(user.getProfilePicture())
                .totalPoints(stats != null ? stats.getTotalPoints() : 0)
                .currentLevel(stats != null ? stats.getCurrentLevel() : 1)
                .rank(rank)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
