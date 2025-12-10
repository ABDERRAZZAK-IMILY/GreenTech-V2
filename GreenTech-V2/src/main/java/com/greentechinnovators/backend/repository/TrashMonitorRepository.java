package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.entity.TrashMonitor;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TrashMonitorRepository extends MongoRepository<TrashMonitor, String> {
}
