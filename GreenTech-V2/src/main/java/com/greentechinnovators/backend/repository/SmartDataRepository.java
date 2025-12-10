package com.greentechinnovators.backend.repository;

import com.greentechinnovators.backend.dto.TopConsumerStats;
import com.greentechinnovators.backend.entity.SmartData;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import org.bson.Document;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SmartDataRepository extends MongoRepository<SmartData, String> {
    List<SmartData> findByDataTypeOrderByTimestampDesc(String dataType);

    SmartData findTopBySensorIdOrderByTimestampDesc(String sensorId);



    /**
     * Calcule la somme totale des valeurs pour un type de donnée spécifique
     * sur une période donnée.
     * * @param dataType Le type de donnée (ex: "ENERGY", "GAS")
     * @param start Date de début
     * @param end Date de fin
     * @return La somme totale (ou null si aucune donnée)
     */
    @Aggregation(pipeline = {
            "{ $match: { dataType: ?0, timestamp: { $gte: ?1, $lte: ?2 } } }", // Filtrer par type et date
            "{ $group: { _id: null, total: { $sum: '$value' } } }"             // Additionner la colonne 'value'
    })
    Double sumValueByDataTypeAndDateRange(String dataType, LocalDateTime start, LocalDateTime end);


    /**
     * Calcule l'impact CO2 total accumulé depuis le début de l'historique.
     * * @return Somme totale de l'impact CO2
     */
    @Aggregation(pipeline = {
            "{ $group: { _id: null, total: { $sum: '$co2Impact' } } }"
    })
    Double sumTotalCo2Impact();

    long countByDataTypeAndTimestampAfter(String dataType, LocalDateTime date);
    long countByDataTypeAndWasteTypeAndTimestampAfter(String dataType, String wasteType, LocalDateTime date);

    @Aggregation(pipeline = {
            "{ $match: { dataType: 'ENERGY', timestamp: { $gte: ?0 } } }",
            "{ $group: { _id: '$location', total: { $sum: '$value' } } }",
            "{ $sort: { total: -1 } }",
            "{ $limit: 1 }"
    })
    List<TopConsumerStats> findTopConsumer(LocalDateTime startDate);
}