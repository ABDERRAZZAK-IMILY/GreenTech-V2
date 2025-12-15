package com.greentechinnovators.backend.gamification.service;

import com.greentechinnovators.backend.entity.User;
import com.greentechinnovators.backend.gamification.domain.Badge;
import com.greentechinnovators.backend.gamification.domain.UserGamificationStats;
import com.greentechinnovators.backend.gamification.dto.response.UserGamificationStatsResponseDTO;
import com.greentechinnovators.backend.gamification.mapper.GamificationMapper;
import com.greentechinnovators.backend.gamification.repository.BadgeRepository;
import com.greentechinnovators.backend.gamification.repository.GamificationStatsRepository;
import com.greentechinnovators.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GamificationService {

    private final GamificationStatsRepository statsRepository;
    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;
    private final GamificationMapper mapper;

    public UserGamificationStatsResponseDTO getUserStats(String userId) {
        UserGamificationStats stats = statsRepository.findByUserId(userId)
                .orElseGet(() -> createInitialStats(userId));

        if (stats.getUserName() == null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                stats.setUserName(user.getName());
                stats.setUserEmail(user.getEmail());
                stats.setRole(user.getRole() != null ? user.getRole().name() : "USER");
                if (stats.getJoinDate() == null) {
                    stats.setJoinDate(user.getCreatedAt());
                }
                if (stats.getStatus() == null) {
                    stats.setStatus("active");
                }
                statsRepository.save(stats);
            }
        }

        User user = userRepository.findById(userId).orElse(null);

        List<Badge> badges = (stats.getEarnedBadgeIds() != null && !stats.getEarnedBadgeIds().isEmpty())
                ? badgeRepository.findAllById(stats.getEarnedBadgeIds())
                : Collections.emptyList();

        int rank = calculateRank(stats.getTotalPoints());

        return mapper.toStatsResponse(stats, user, badges, rank);
    }

    public List<UserGamificationStatsResponseDTO> getLeaderboard() {
        List<UserGamificationStats> topStats = statsRepository.findTop10ByOrderByTotalPointsDesc();

        return topStats.stream().map(stats -> {
            // Populate user info if not already set
            if (stats.getUserName() == null) {
                User user = userRepository.findById(stats.getUserId()).orElse(null);
                if (user != null) {
                    stats.setUserName(user.getName());
                    stats.setUserEmail(user.getEmail());
                    stats.setRole(user.getRole() != null ? user.getRole().name() : "USER");
                    if (stats.getJoinDate() == null) {
                        stats.setJoinDate(user.getCreatedAt());
                    }
                    if (stats.getStatus() == null) {
                        stats.setStatus("active");
                    }
                    statsRepository.save(stats);
                }
            }

            User user = userRepository.findById(stats.getUserId()).orElse(null);

            int rank = topStats.indexOf(stats) + 1;

            return mapper.toStatsResponse(stats, user, Collections.emptyList(), rank);
        }).collect(Collectors.toList());
    }

    private int calculateRank(int points) {
        return (int) statsRepository.countByTotalPointsGreaterThan(points) + 1;
    }

    private UserGamificationStats createInitialStats(String userId) {
        User user = userRepository.findById(userId).orElse(null);

        UserGamificationStats.UserGamificationStatsBuilder builder = UserGamificationStats.builder()
                .userId(userId)
                .totalPoints(0)
                .pointsEarned(0)
                .pointsSpent(0)
                .currentLevel(1)
                .carbonSaved(0)
                .actionsCompleted(0)
                .status("active");

        if (user != null) {
            builder.userName(user.getName())
                   .userEmail(user.getEmail())
                   .role(user.getRole() != null ? user.getRole().name() : "USER")
                   .joinDate(user.getCreatedAt());
        }

        return statsRepository.save(builder.build());
    }

    public void addPoints(String userId, int points) {
        UserGamificationStats stats = statsRepository.findByUserId(userId)
                .orElseGet(() -> createInitialStats(userId));

        stats.setTotalPoints(stats.getTotalPoints() + points);
        stats.setPointsEarned(stats.getPointsEarned() + points);  // Track total earned

        if (stats.getTotalPoints() > stats.getCurrentLevel() * 1000) {
            stats.setCurrentLevel(stats.getCurrentLevel() + 1);
        }

        statsRepository.save(stats);
    }

    public void deductPoints(String userId, int points) {
        UserGamificationStats stats = statsRepository.findByUserId(userId)
                .orElseGet(() -> createInitialStats(userId));

        if (stats.getTotalPoints() >= points) {
            stats.setTotalPoints(stats.getTotalPoints() - points);
            stats.setPointsSpent(stats.getPointsSpent() + points);  // Track total spent
            statsRepository.save(stats);
        } else {
            throw new IllegalArgumentException("Insufficient points");
        }
    }

    public void incrementActionsCompleted(String userId) {
        UserGamificationStats stats = statsRepository.findByUserId(userId)
                .orElseGet(() -> createInitialStats(userId));

        stats.setActionsCompleted(stats.getActionsCompleted() + 1);
        statsRepository.save(stats);
    }
}