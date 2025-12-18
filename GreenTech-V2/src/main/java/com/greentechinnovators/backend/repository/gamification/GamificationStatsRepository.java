package com.greentechinnovators.backend.repository.gamification;

import com.greentechinnovators.backend.entity.gamification.UserGamificationStats;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface GamificationStatsRepository extends MongoRepository<UserGamificationStats, String> {

    Optional<UserGamificationStats> findByUserId(String userId);
    Optional<UserGamificationStats> findByUserEmail(String email);
    List<UserGamificationStats> findTop10ByOrderByTotalPointsDesc();

    long countByTotalPointsGreaterThan(int totalPoints);
}