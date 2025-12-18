package com.greentechinnovators.backend.repository.gamification;

import com.greentechinnovators.backend.entity.gamification.Badge;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BadgeRepository extends MongoRepository<Badge, String> {
}