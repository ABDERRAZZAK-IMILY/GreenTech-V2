package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.dto.AI.DailyStat;
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
            "{ '$group': { '_id': null, 'total': { '$sum': '$value' } } }"
    })
    Double sumValueByCreatedAtAfter(LocalDateTime date);

    @Aggregation(pipeline = {
            "{ '$match': { 'createdAt': { '$gte': ?0 } } }",
            "{ '$group': { '_id': { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, 'total': { '$sum': '$value' } } }",
            "{ '$sort': { '_id': 1 } }"
    })
    List<DailyStat> getLast7DaysStats(LocalDateTime startDate);
    @Aggregation(pipeline = {
            // 1. Filter: Get docs where createdAt is >= start (?0) AND <= end (?1)
            "{ '$match': { 'createdAt': { '$gte': ?0, '$lte': ?1 } } }",

            // 2. Sort: Ensure they come out in time order (Oldest -> Newest)
            // This is CRUCIAL for your distance calculation algorithm
            "{ '$sort': { 'createdAt': 1 } }"
    })
    List<Energy> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}