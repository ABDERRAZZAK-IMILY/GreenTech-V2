package com.greentechinnovators.backend.dto.marketplace.response;

import com.greentechinnovators.backend.Enums.marketplace.OrderStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class OrderResponseDTO {
    private String id;
    private String productName;
    private int cost;
    private OrderStatus status;
    private LocalDateTime orderDate;

    private String userName;
    private String userId;
}