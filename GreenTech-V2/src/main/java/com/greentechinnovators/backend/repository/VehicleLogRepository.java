package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.entity.VehicleLog;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface VehicleLogRepository extends MongoRepository<VehicleLog,String> {
}
