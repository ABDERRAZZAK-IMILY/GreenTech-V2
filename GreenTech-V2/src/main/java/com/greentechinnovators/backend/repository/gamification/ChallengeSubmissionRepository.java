package com.greentechinnovators.backend.repository.gamification;

import com.greentechinnovators.backend.entity.gamification.ChallengeSubmission;
import com.greentechinnovators.backend.Enums.gamification.SubmissionStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ChallengeSubmissionRepository extends MongoRepository<ChallengeSubmission, String> {
    List<ChallengeSubmission> findByStatus(SubmissionStatus status);

    List<ChallengeSubmission> findByUserId(String userId);
}