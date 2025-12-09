package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.entity.TransportData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransportRepository extends MongoRepository<TransportData, String> {
    List<TransportData> findByVehicleIdOrderByTimestampDesc(String vehicleId);
}