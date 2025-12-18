package com.greentechinnovators.backend.repository.gamification;

import com.greentechinnovators.backend.entity.gamification.Challenge;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ChallengeRepository extends MongoRepository<Challenge, String> {
    List<Challenge> findByIsActiveTrue();
}