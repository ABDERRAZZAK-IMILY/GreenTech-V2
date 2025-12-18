package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.dto.ai.DailyStat;
import com.greentechinnovators.backend.entity.Energy;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EnergyRepository extends MongoRepository<Energy, String> {
    List<Energy> findAllByOrderByCreatedAtDesc();

    @Aggregation(pipeline = {
            "{ '$match': { 'createdAt': { '$gte': ?0 } } }",
            "{ '$group': { '_id': null, 'total': { '$sum': '$energyConsumed' } } }"
    })
    Double sumValueByCreatedAtAfter(LocalDateTime date);

    @Aggregation(pipeline = {
            "{ '$match': { 'createdAt': { '$gte': ?0 } } }",

            "{ '$project': { " +
                    "    'date': { '$dateToString': { 'format': '%Y-%m-%d', 'date': '$createdAt' } }, " +
                    "    'energyConsumed': 1 " +
                    "} }",

            "{ '$group': { " +
                    "    '_id': '$date', " +
                    "    'total': { '$sum': '$energyConsumed' } " +
                    "} }",

            "{ '$project': { " +
                    "    '_id': 0, " +
                    "    'date': '$_id', " +
                    "    'total': 1 " +
                    "} }",

            "{ '$sort': { 'date': 1 } }"
    })
    List<DailyStat> getLast7DaysStats(LocalDateTime startDate);

}