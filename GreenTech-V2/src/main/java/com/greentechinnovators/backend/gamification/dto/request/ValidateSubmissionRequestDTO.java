package com.greentechinnovators.backend.gamification.dto.request;

import com.greentechinnovators.backend.gamification.domain.SubmissionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ValidateSubmissionRequestDTO {
    @NotNull
    private SubmissionStatus status; // APPROVED or REJECTED
    private String adminComment;
}