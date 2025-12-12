package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.dto.AI.DailyStat;
import com.greentechinnovators.backend.entity.Energy;
import com.greentechinnovators.backend.entity.Trash;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Repository
public interface TrashRepository extends MongoRepository<Trash, String> {
    List<Trash> findAllByOrderByCreatedAtDesc();

    @Aggregation(pipeline = {
            "{ '$match': { 'createdAt': { '$gte': ?0 } } }",
            "{ '$group': { '_id': null, 'total': { '$sum': '$weight' } } }"
    })
    Double sumWeightByCreatedAtAfter(LocalDateTime date);

    @Aggregation(pipeline = {
            "{ '$match': { 'createdAt': { '$gte': ?0 } } }",
            "{ '$group': { '_id': { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, 'total': { '$sum': '$weight' } } }", // <-- weight
            "{ '$sort': { '_id': 1 } }"
    })
    List<DailyStat> getLast7DaysStats(LocalDateTime startDate);

    @Query("{ 'createdAt' : { '$gte' : ?0, '$lt' : ?1 } }")
    List<Trash> findByDateRange(Date start, Date end);

}