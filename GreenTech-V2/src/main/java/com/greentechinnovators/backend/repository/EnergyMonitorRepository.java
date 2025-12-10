package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.entity.EnergyMonitor;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EnergyMonitorRepository extends MongoRepository<EnergyMonitor, String> {
}
