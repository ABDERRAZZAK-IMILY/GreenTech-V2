package com.greentechinnovators.backend.dto.gamification.request;

import com.greentechinnovators.backend.Enums.gamification.SubmissionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ValidateSubmissionRequestDTO {
    @NotNull
    private SubmissionStatus status; // APPROVED or REJECTED
    private String adminComment;
}