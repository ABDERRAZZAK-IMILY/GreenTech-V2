package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.entity.Gas;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GasRepository extends MongoRepository<Gas, String> {
}
