package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.entity.GasMonitor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GasMonitorRepository extends MongoRepository<GasMonitor, String> {
}
