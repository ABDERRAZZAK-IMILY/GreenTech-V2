package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User , String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String login);
    List<User> findByDepartment(String department);
}
