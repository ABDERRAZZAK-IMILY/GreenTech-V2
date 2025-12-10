package com.greentechinnovators.backend.marketplace.domain;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "marketplace_orders")
public class MarketplaceOrder {
    @Id
    private String id;

    private String userId;

    private String productId;
    private String productName;
    private int costAtPurchase;

    private OrderStatus status;

    @CreatedDate
    private LocalDateTime orderDate;
}