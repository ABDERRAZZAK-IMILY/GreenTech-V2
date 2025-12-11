package com.greentechinnovators.backend.marketplace.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateOrderRequestDTO {
    @NotBlank(message = "Product ID is required")
    private String productId;
}