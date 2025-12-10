package com.greentechinnovators.backend.marketplace.domain;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
public class Product {
    @Id
    private String id;
    private String name;
    private String description;
    private int costInPoints;
    private String imageUrl;
    private int stockQuantity;
    private boolean isActive;
    private String category; // Product category (e.g., ECO_PRODUCTS, ENERGY_SAVING, RECYCLING)
    private double rating;   // Product rating (0.0 to 5.0)
}