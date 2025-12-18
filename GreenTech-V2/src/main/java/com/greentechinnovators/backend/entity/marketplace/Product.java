package com.greentechinnovators.backend.entity.marketplace;

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
    private String emoji;          // Product emoji for UI display (e.g., 🎁, 💰, 🏠)
    private String description;
    private int costInPoints;
    private String imageUrl;
    private int stockQuantity;
    private boolean isActive;
    private String category;       // Product category (e.g., ECO_PRODUCTS, ENERGY_SAVING, RECYCLING)
    private String badge;          // Special badge (e.g., Populaire, Premium, Meilleure affaire)
    private double rating;         // Product rating (0.0 to 5.0)
}