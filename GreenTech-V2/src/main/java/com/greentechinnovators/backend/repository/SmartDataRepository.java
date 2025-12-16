package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.dto.ai.TopConsumerStats;
import com.greentechinnovators.backend.entity.SmartData;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SmartDataRepository extends MongoRepository<SmartData, String> {
    List<SmartData> findByDataTypeOrderByTimestampDesc(String dataType);

    @Aggregation(pipeline = {
            "{ $match: { dataType: 'ENERGY', timestamp: { $gte: ?0 } } }",
            "{ $group: { _id: '$location', total: { $sum: '$value' } } }",
            "{ $sort: { total: -1 } }",
            "{ $limit: 1 }"
    })
    List<TopConsumerStats> findTopConsumer(LocalDateTime startDate);

    @Aggregation(pipeline = {
            "{ $match: { dataType: ?0, timestamp: { $gte: ?1, $lte: ?2 } } }",
            "{ $group: { _id: null, total: { $sum: '$value' } } }"
    })
    Double sumValueByDataTypeAndDateRange(String dataType, LocalDateTime start, LocalDateTime end);
    @Aggregation(pipeline = {
            "{ $match: { dataType: ?0, timestamp: { $gte: ?1, $lte: ?2 } } }",
            "{ $group: { _id: null, total: { $sum: '$co2Impact' } } }"
    })
    Double sumCo2ByDataTypeAndDateRange(String dataType, LocalDateTime start, LocalDateTime end);
    long countByStatusAndTimestampAfter(String status, LocalDateTime date);
}