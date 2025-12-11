package com.greentechinnovators.backend.gamification.dto.response;

import com.greentechinnovators.backend.gamification.domain.SubmissionStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SubmissionResponseDTO {
    private String id;
    private String challengeId;
    private String challengeTitle;
    private String proofImageUrl;
    private SubmissionStatus status;
    private LocalDateTime submissionDate;
    private String adminComment;
    private Integer pointsAwarded;
}
