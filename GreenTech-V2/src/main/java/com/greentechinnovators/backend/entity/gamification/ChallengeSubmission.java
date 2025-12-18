package com.greentechinnovators.backend.entity.gamification;

import com.greentechinnovators.backend.Enums.gamification.SubmissionStatus;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "challenge_submissions")
public class ChallengeSubmission {
    @Id
    private String id;

    private String userId;
    private String challengeId;

    private String proofImageUrl;
    private String adminComment;

    private SubmissionStatus status;

    @CreatedDate
    private LocalDateTime submissionDate;
}