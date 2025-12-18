package com.greentechinnovators.backend.entity.gamification;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "challenges")
public class Challenge {
    @Id
    private String id;

    private String title;
    private String description;
    private int pointsReward;
    private String category; // energy, trash
    private boolean isActive;
}