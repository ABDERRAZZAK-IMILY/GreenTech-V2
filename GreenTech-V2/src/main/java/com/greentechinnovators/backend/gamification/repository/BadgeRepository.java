package com.greentechinnovators.backend.gamification.repository;

import com.greentechinnovators.backend.gamification.domain.Badge;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BadgeRepository extends MongoRepository<Badge, String> {
}