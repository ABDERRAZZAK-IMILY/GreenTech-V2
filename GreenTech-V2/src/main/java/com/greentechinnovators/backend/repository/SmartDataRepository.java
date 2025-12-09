package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.entity.SmartData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SmartDataRepository extends MongoRepository<SmartData, String> {
    List<SmartData> findByDataTypeOrderByTimestampDesc(String dataType);

    SmartData findTopBySensorIdOrderByTimestampDesc(String sensorId);
}