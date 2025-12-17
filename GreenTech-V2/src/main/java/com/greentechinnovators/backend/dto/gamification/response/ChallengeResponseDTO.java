package com.greentechinnovators.backend.dto.gamification.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChallengeResponseDTO {
    private String id;
    private String title;
    private String description;
    private int pointsReward;
    private String category;
    private boolean isActive;
}