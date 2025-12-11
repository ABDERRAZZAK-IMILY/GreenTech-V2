package com.greentechinnovators.backend.gamification.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BadgeResponseDTO {
    private String id;
    private String name;
    private String description;
    private String iconUrl;
}