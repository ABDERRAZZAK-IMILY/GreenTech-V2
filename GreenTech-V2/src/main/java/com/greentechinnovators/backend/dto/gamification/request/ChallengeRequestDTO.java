package com.greentechinnovators.backend.dto.gamification.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ChallengeRequestDTO {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @Positive(message = "Points must be positive")
    private int pointsReward;

    @NotBlank(message = "Category is required")
    private String category;
}