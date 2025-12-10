package com.greentechinnovators.backend.marketplace.dto.request;

import com.greentechinnovators.backend.marketplace.domain.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOrderStatusRequestDTO {
    @NotNull(message = "Status is required")
    private OrderStatus status;
}