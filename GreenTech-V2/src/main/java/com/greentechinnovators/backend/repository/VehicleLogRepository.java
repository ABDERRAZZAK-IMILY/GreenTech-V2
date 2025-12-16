package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.dto.DailyStatProjection;
import com.greentechinnovators.backend.entity.VehicleLog;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VehicleLogRepository extends MongoRepository<VehicleLog,String> {


    @Aggregation(pipeline = {
            "{ '$match': { 'createdAt': { '$gte': ?0 } } }",
            "{ '$group': { '_id': { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, 'total': { '$sum': '$distanceTravelled' } } }",

            "{ '$project': { " +
                    "    '_id': 0, " +
                    "    'date': '$_id', " +
                    "    'total': 1 " +
                    "} }",

            "{ '$sort': { 'date': 1 } }"
    })
    List<DailyStatProjection> getLast7DaysStats(LocalDateTime startDate);


}
