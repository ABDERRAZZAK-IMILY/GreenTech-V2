package com.greentechinnovators.backend.dto.ai;

import lombok.Data;

import java.util.List;

@Data
public class PredictionResponse {
    private CategoryPrediction electricite;
    private CategoryPrediction gaz;
    private CategoryPrediction transport;
    private CategoryPrediction dechets;

    @Data
    public static class CategoryPrediction {
        private String valeurPrincipale;
        private String pourcentage;
        private String coutPrevu;
        private String emissionCo2;
        private List<Double> history;

    }

}