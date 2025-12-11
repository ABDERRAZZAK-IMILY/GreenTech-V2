package com.greentechinnovators.backend.dto.AI;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AISummaryDTO {
    // 1. Énergie
    private double currentMonthEnergy;    // Consommation d'énergie du mois en cours
    private double lastMonthEnergy;       // Consommation du mois précédent (pour comparaison)
    private String energyTrend;           // Tendance (ex: "+10%" ou "-5%")

    // 2. Environnement
    private double totalCo2;              // Impact total carbone depuis le début (Lifetime)
    private double recyclingRate;         // Taux de recyclage en pourcentage

    // 3. Finance (Estimation)
    private double estimatedCost;         // Coût estimé pour le mois en cours

    private String topConsumer;
}