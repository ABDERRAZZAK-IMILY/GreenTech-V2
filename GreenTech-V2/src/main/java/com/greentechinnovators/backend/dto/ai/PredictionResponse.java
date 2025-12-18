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

        private List<DistributionItem> distribution;

    }
    public static class DistributionItem {
        private String label;
        private String value;

        public DistributionItem() {}
        public DistributionItem(String label, String value) {
            this.label = label;
            this.value = value;
        }
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
    }
}