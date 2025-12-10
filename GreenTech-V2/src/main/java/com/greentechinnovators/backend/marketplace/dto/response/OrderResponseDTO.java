package com.greentechinnovators.backend.marketplace.dto.response;

import com.greentechinnovators.backend.marketplace.domain.OrderStatus;
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