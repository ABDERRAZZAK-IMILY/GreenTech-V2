package com.greentechinnovators.backend.repository.marketplace;

import com.greentechinnovators.backend.entity.marketplace.MarketplaceOrder;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MarketplaceOrderRepository extends MongoRepository<MarketplaceOrder, String> {
    List<MarketplaceOrder> findByUserIdOrderByOrderDateDesc(String userId);
    List<MarketplaceOrder> findAllByOrderByOrderDateDesc();
}