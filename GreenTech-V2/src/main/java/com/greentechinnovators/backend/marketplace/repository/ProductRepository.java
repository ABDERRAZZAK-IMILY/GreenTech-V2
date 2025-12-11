package com.greentechinnovators.backend.marketplace.repository;

import com.greentechinnovators.backend.marketplace.domain.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByIsActiveTrue();
}