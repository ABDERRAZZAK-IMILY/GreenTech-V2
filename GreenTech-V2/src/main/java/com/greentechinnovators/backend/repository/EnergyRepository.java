package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.entity.Energy;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnergyRepository extends MongoRepository<Energy, String> {
//    List<Energy> findAllByOrderByTimestampDesc();
}