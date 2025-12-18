package com.greentechinnovators.backend.repository.marketplace;

import com.greentechinnovators.backend.entity.marketplace.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByIsActiveTrue();
}