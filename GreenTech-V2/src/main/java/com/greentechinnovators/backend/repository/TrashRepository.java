package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.dto.DailyStatProjection;
import com.greentechinnovators.backend.entity.Trash;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TrashRepository extends MongoRepository<Trash, String> {
    List<Trash> findAllByOrderByCreatedAtDesc();


    @Aggregation(pipeline = {
            "{ '$match': { 'createdAt': { '$gte': ?0 } } }",
            "{ '$project': { " +
                    "    'date': { '$dateToString': { 'format': '%Y-%m-%d', 'date': '$createdAt' } }, " +
                    "    'wight': 1 " +
                    "} }",

            "{ '$group': { " +
                    "    '_id': '$date', " +
                    "    'total': { '$sum': '$wight' } " +
                    "} }",

            "{ '$project': { " +
                    "    '_id': 0, " +
                    "    'date': '$_id', " +
                    "    'total': 1 " +
                    "} }",

            "{ '$sort': { 'date': 1 } }"
    })
    List<DailyStatProjection> getLast7DaysStats(LocalDateTime startDate);


}