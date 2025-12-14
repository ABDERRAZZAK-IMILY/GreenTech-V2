package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.dto.AI.DailyStat;
import com.greentechinnovators.backend.entity.Gas;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;
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
            "{ '$project': { " +
                    "    'date': { '$dateToString': { 'format': '%Y-%m-%d', 'date': '$createdAt' } }, " +
                    "    'consumedGas': 1 " +
                    "} }",
            "{ '$group': { " +
                    "    '_id': '$date', " +
                    "    'total': { '$sum': '$consumedGas' } " +
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
