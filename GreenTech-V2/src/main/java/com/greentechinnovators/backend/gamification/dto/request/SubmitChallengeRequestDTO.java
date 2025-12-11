package com.greentechinnovators.backend.gamification.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubmitChallengeRequestDTO {
    @NotBlank(message = "Challenge ID is required")
    private String challengeId;

    @NotBlank(message = "Proof Image URL is required")
    private String proofImageUrl;
}