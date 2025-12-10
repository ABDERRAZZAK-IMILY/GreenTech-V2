package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.entity.TrashMonitor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface TrashMonitorRepository extends MongoRepository<TrashMonitor, String> {
    Optional<TrashMonitor> findByMacAddress(String macAddress);
}
