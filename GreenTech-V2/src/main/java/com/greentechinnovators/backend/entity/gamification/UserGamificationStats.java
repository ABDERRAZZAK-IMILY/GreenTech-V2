package com.greentechinnovators.backend.entity.gamification;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Document(collection = "gamification_stats")
public class UserGamificationStats {
    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    // User Information (populated from User entity or stored directly)
    private String userName;
    private String userEmail;
    private String role;

    // Points Statistics
    private int totalPoints;
    private int pointsEarned;  // Total points earned (never decreases)
    private int pointsSpent;// Total points spent on marketplace items

    private int totalActions;    // Total number of actions performed

    private int totalChallenges; // Total number of challenges completed

    // Game Progress
    private int currentLevel;
    private int carbonSaved;
    private int actionsCompleted;  // Total number of completed challenges/actions

    @Builder.Default
    private List<String> earnedBadgeIds = new ArrayList<>();

    // Account Information
    private LocalDateTime joinDate;
    private String status;  // active, inactive
}