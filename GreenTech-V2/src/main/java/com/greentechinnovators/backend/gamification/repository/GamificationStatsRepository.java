package com.greentechinnovators.backend.gamification.repository;

import com.greentechinnovators.backend.gamification.domain.UserGamificationStats;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface GamificationStatsRepository extends MongoRepository<UserGamificationStats, String> {

    Optional<UserGamificationStats> findByUserId(String userId);

    List<UserGamificationStats> findTop10ByOrderByTotalPointsDesc();

    long countByTotalPointsGreaterThan(int totalPoints);
}