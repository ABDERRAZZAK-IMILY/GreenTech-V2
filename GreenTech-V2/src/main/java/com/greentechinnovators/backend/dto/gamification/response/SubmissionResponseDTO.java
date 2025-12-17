package com.greentechinnovators.backend.dto.gamification.response;

import com.greentechinnovators.backend.Enums.gamification.SubmissionStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SubmissionResponseDTO {
    private String id;
    private String userId;
    private String userName;
    private String challengeId;
    private String challengeTitle;
    private String challengeCategory;
    private String proofImageUrl;
    private SubmissionStatus status;
    private LocalDateTime submissionDate;
    private String adminComment;
    private Integer pointsAwarded;
}
