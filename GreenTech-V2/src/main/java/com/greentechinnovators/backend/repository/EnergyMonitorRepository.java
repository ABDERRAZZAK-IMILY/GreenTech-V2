package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.entity.EnergyMonitor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EnergyMonitorRepository extends MongoRepository<EnergyMonitor, String> {
    Optional<EnergyMonitor> findByMacAddress(String macAddress);
}
