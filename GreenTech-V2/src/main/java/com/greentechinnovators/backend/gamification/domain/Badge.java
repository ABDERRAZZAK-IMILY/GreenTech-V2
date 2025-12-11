package com.greentechinnovators.backend.gamification.domain;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "badges")
public class Badge {
    @Id
    private String id;
    private String name; // emperor of piece
    private String description; // make 10000 hand hack
    private String iconUrl;     // icon link
    private int pointsThreshold; // points needed to earn this badge
}