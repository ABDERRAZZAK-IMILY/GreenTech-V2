package com.greentechinnovators.backend.dto.ai;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AISummaryDTO {
    private double currentMonthEnergy;
    private double lastMonthEnergy;
    private String energyTrend;

    private double totalCo2;
    private double recyclingRate;

    private double estimatedCost;

    private String topConsumer;
}