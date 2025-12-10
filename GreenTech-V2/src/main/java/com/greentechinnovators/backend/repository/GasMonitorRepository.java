package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.entity.GasMonitor;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface GasMonitorRepository extends MongoRepository<GasMonitor, String> {
}
