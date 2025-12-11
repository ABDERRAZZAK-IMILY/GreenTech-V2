package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.entity.VehicleLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VehicleLogRepository extends MongoRepository<VehicleLog,String> {
    List<VehicleLog> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
