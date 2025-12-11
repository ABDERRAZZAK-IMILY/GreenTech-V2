package com.greentechinnovators.backend.marketplace.repository;

import com.greentechinnovators.backend.marketplace.domain.MarketplaceOrder;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MarketplaceOrderRepository extends MongoRepository<MarketplaceOrder, String> {
    List<MarketplaceOrder> findByUserIdOrderByOrderDateDesc(String userId);
    List<MarketplaceOrder> findAllByOrderByOrderDateDesc();
}