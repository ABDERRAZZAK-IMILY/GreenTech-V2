package com.greentechinnovators.backend.gamification.repository;

import com.greentechinnovators.backend.gamification.domain.Challenge;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ChallengeRepository extends MongoRepository<Challenge, String> {
    List<Challenge> findByIsActiveTrue();
}