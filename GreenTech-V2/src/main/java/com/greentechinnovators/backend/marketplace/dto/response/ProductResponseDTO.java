package com.greentechinnovators.backend.marketplace.dto.response;

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
    private int stockQuantity;
    private boolean isActive;
    private String category;
    private double rating;
}
