package com.greentechinnovators.backend.repository;


import com.greentechinnovators.backend.entity.Vehicle;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface VehicleRepository extends MongoRepository<Vehicle,String> {
}
