package com.greentechinnovators.backend.dto.marketplace.request;

import com.greentechinnovators.backend.Enums.marketplace.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOrderStatusRequestDTO {
    @NotNull(message = "Status is required")
    private OrderStatus status;
}