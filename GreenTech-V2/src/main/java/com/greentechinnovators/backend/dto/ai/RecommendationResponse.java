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
        private String id;          // ex: "solar-install"
        private String title;       // ex: "Panneaux Solaires"
        private String icon;        // ex: "sun" (FontAwesome)
        private String description;
        private Impact impact;
        private List<String> steps;
        private List<Benefit> benefits;
    }

    @Data
    public static class Impact {
        private String co2;         // ex: "-8.5 tonnes CO2/an"
        private String cost;        // ex: "-5,200 MAD/an"
        private String difficulty;  // IMPORTANT: "Facile", "Moyen", ou "Difficile"
        private String time;        // ex: "ROI 5 ans"
        private String investissement; // ex: "25,000 MAD" (Optionnel)
    }

    @Data
    public static class Benefit {
        private String icon;  // ex: "bolt"
        private String label; // ex: "Production"
        private String value; // ex: "~8,000 kWh/an"
    }
}