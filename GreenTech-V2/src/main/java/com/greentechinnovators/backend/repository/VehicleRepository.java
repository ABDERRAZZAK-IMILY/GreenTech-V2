package com.greentechinnovators.backend.repository;


import com.greentechinnovators.backend.entity.Vehicle;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VehicleRepository extends MongoRepository<Vehicle,String> {
    Optional<Vehicle> findVehicleByUserId(String userId);
}
