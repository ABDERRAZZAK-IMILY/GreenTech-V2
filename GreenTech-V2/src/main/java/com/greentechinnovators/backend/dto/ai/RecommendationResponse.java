package com.greentechinnovators.backend.dto.ai;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {
    private List<RecommendationAction> actions;

    @Data
    public static class RecommendationAction {
        private String id;
        private String title;
        private String icon;
        private String description;
        private Impact impact;
        private List<String> steps;
        private List<Benefit> benefits;
    }

    @Data
    public static class Impact {
        private String co2;
        private String cost;
        private String difficulty;
        private String time;
        private String investissement;
    }

    @Data
    public static class Benefit {
        private String icon;
        private String label;
        private String value;
    }
}