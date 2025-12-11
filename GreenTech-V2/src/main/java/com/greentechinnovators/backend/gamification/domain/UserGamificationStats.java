package com.greentechinnovators.backend.gamification.domain;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "gamification_stats")
public class UserGamificationStats {
    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private int totalPoints;
    private int currentLevel;
    private int carbonSaved;

    @Builder.Default
    private List<String> earnedBadgeIds = new ArrayList<>();
}