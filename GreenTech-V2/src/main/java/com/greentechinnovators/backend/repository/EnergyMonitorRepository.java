package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.entity.EnergyMonitor;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface EnergyMonitorRepository extends MongoRepository<EnergyMonitor, String> {
    Optional<EnergyMonitor> findByMacAddress(String macAddress);
}
