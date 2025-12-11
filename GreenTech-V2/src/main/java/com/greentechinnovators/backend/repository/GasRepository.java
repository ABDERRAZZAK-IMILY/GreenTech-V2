package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.dto.AI.DailyStat;
import com.greentechinnovators.backend.entity.Gas;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GasRepository extends MongoRepository<Gas, String> {
    @Aggregation(pipeline = {
            "{ '$match': { 'createdAt': { '$gte': ?0 } } }",
            "{ '$group': { '_id': null, 'total': { '$sum': '$consumedGas' } } }"
    })
    Double sumValueByCreatedAtAfter(LocalDateTime date);

    @Aggregation(pipeline = {
            "{ '$match': { 'createdAt': { '$gte': ?0 } } }",
            "{ '$group': { '_id': { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, 'total': { '$sum': '$consumedGas' } } }",
            "{ '$sort': { '_id': 1 } }"
    })
    List<DailyStat> getLast7DaysStats(LocalDateTime startDate);
}
