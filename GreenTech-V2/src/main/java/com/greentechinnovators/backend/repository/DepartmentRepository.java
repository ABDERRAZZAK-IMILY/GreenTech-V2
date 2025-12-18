package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.entity.Department;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentRepository extends MongoRepository<Department, String> {
    // You can add custom queries here if needed, e.g., boolean existsByName(String name);
    Optional<Department> findByName(String name);
}
