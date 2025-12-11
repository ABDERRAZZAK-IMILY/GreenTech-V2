package com.greentechinnovators.backend.gamification.repository;

import com.greentechinnovators.backend.gamification.domain.ChallengeSubmission;
import com.greentechinnovators.backend.gamification.domain.SubmissionStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ChallengeSubmissionRepository extends MongoRepository<ChallengeSubmission, String> {
    List<ChallengeSubmission> findByStatus(SubmissionStatus status);

    List<ChallengeSubmission> findByUserId(String userId);
}