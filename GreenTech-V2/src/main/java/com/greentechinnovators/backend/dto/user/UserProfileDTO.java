package com.greentechinnovators.backend.dto.user;

import com.greentechinnovators.backend.Enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserProfileDTO {
    private String id;
    private String name;
    private String email;
    private Role role;
    private String department;
    private String jobTitle;
    
    // Profile information
    private String profilePicture;
    
    // Gamification stats
    private Integer totalPoints;
    private Integer currentLevel;
    private Integer rank;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
