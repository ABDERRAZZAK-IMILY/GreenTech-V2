package com.greentechinnovators.backend.gamification.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class UserGamificationStatsResponseDTO {
    private String userId;
    private String fullName;
    private String profilePicture;

    private int totalPoints;
    private int currentLevel;
    private int carbonSaved;
    private int rank;

    private List<BadgeResponseDTO> earnedBadges;
}