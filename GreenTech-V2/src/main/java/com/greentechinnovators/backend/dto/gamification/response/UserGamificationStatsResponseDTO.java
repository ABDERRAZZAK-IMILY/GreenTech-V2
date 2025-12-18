package com.greentechinnovators.backend.dto.gamification.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class UserGamificationStatsResponseDTO {
    private String userId;
    private String userName;
    private String email;
    private String department;
    private String role;
    
    private Integer currentPoints;
    private Integer totalPointsEarned;
    private Integer totalPointsSpent;
    private Integer totalActions;
    private Integer badgesCount;
    private Integer level;
    private LocalDateTime joinDate;
}