package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.entity.Trash;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TrashRepository extends MongoRepository<Trash, String> {
    List<Trash> findByTrashDateBetween(LocalDateTime start, LocalDateTime end);

}