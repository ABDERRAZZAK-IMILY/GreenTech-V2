package com.greentechinnovators.backend.marketplace.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductRequestDTO {
    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Cost in points is required")
    @Min(value = 1, message = "Cost must be at least 1 point")
    private Integer costInPoints;

    //private String imageUrl;
    private String emoji;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    @NotBlank(message = "Category is required")
    private String category;

    @Min(value = 0, message = "Rating cannot be negative")
    private Double rating;
}
