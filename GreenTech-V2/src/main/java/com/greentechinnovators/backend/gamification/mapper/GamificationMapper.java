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
                .isActive(true)
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
                .userName(stats.getUserName())
                .email(stats.getUserEmail())
                .role(stats.getRole())
                .currentPoints(stats.getTotalPoints())
                .totalPointsEarned(stats.getPointsEarned())
                .totalPointsSpent(stats.getPointsSpent())
                .totalActions(stats.getActionsCompleted())
                .badgesCount(0)
                .level(stats.getCurrentLevel())
                .joinDate(stats.getJoinDate())
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
                .userName(user != null ? user.getName() : stats.getUserName())
                .email(user != null ? user.getEmail() : stats.getUserEmail())
                .department(user != null ? user.getDepartment() : null)
                .role(user != null && user.getRole() != null ? user.getRole().name() : stats.getRole())
                .currentPoints(stats.getTotalPoints())
                .totalPointsEarned(stats.getPointsEarned())
                .totalPointsSpent(stats.getPointsSpent())
                .totalActions(stats.getActionsCompleted())
                .badgesCount(badges != null ? badges.size() : 0)
                .level(stats.getCurrentLevel())
                .joinDate(stats.getJoinDate())
                .build();
    }
}