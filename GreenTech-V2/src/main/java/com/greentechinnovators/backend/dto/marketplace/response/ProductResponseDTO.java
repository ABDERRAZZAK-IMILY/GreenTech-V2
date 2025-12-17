package com.greentechinnovators.backend.dto.marketplace.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductResponseDTO {
    private String id;
    private String name;
    private String description;
    private int costInPoints;
    private String imageUrl;
    private String emoji;
    private int stockQuantity;
    private boolean isActive;
    private String category;
    private double rating;
}
