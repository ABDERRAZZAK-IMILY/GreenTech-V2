package com.greentechinnovators.backend.gamification.mapper;

import com.greentechinnovators.backend.entity.User;
import com.greentechinnovators.backend.gamification.domain.Badge;
import com.greentechinnovators.backend.gamification.domain.Challenge;
import com.greentechinnovators.backend.gamification.domain.UserGamificationStats;
import com.greentechinnovators.backend.gamification.dto.request.ChallengeRequestDTO;
import com.greentechinnovators.backend.gamification.dto.response.BadgeResponseDTO;
import com.greentechinnovators.backend.gamification.dto.response.ChallengeResponseDTO;
import com.greentechinnovators.backend.gamification.dto.response.UserGamificationStatsResponseDTO;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class GamificationMapper {



    public Challenge toEntity(ChallengeRequestDTO dto) {
        return Challenge.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .pointsReward(dto.getPointsReward())
                .category(dto.getCategory())
                .isActive(true) // Default to active
                .build();
    }

    public ChallengeResponseDTO toResponse(Challenge challenge) {
        return ChallengeResponseDTO.builder()
                .id(challenge.getId())
                .title(challenge.getTitle())
                .description(challenge.getDescription())
                .pointsReward(challenge.getPointsReward())
                .category(challenge.getCategory())
                .isActive(challenge.isActive())
                .build();
    }

    public UserGamificationStatsResponseDTO toStatsResponse(UserGamificationStats stats, int rank) {
        return UserGamificationStatsResponseDTO.builder()
                .userId(stats.getUserId())
                .totalPoints(stats.getTotalPoints())
                .currentLevel(stats.getCurrentLevel())
                .carbonSaved(stats.getCarbonSaved())
                .rank(rank)
                .build();
    }


    public BadgeResponseDTO toBadgeResponse(Badge badge) {
        return BadgeResponseDTO.builder()
                .id(badge.getId())
                .name(badge.getName())
                .description(badge.getDescription())
                .iconUrl(badge.getIconUrl())
                .build();
    }

    public UserGamificationStatsResponseDTO toStatsResponse(UserGamificationStats stats, User user, List<Badge> badges, int rank) {
        return UserGamificationStatsResponseDTO.builder()
                .userId(stats.getUserId())
                .fullName(user != null ? user.getName() : "Unknown User")
                .totalPoints(stats.getTotalPoints())
                .currentLevel(stats.getCurrentLevel())
                .carbonSaved(stats.getCarbonSaved())
                .rank(rank)
                .earnedBadges(badges.stream().map(this::toBadgeResponse).collect(Collectors.toList()))
                .build();
    }
}