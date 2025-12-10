package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.TopConsumerStats;
import com.greentechinnovators.backend.repository.SmartDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AIService {

    @Value("${spring.ai.deepseek.api-key}")
    private String apiKey;

    @Value("${spring.ai.deepseek.base-url}")
    private String apiUrl;

    @Value("${spring.ai.deepseek.model}")
    private String model;

    private static final double COST_ELEC = 1.2; // MAD/kWh
    private static final double COST_GAS = 10.5; // MAD/m3

    private final SmartDataRepository repository;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String SYSTEM_PROMPT_TEMPLATE = """
            Tu es l'assistant IA de 'GreenTech Innovators'.
            
            🚨 RÔLE & LANGUE :
            - Tu es un expert en efficacité énergétique.
            - Tu parles par défaut en Français.
            - ✅ SI l'utilisateur te parle en Darija (Marocain) ou demande "bdarija", TU DOIS répondre en Darija.
            
            ℹ️ CONTEXTE DU PROJET (Pour les questions générales) :
            - Nom : GreenTech Innovators.
            - Mission : Aider les entreprises à réduire leur empreinte carbone via l'IoT et l'IA.
            - Plan/Objectif : Réduire les coûts de 20%% et le CO2 de 50%% d'ici 2030. Surveiller l'électricité, le gaz, le transport et les déchets.
            
            📊 DONNÉES TEMPS RÉEL (SOURCE DE VÉRITÉ) :
            %s
            
            ⛔ INTERDICTIONS (GUARDRAILS) :
            1. Ne jamais écrire de code informatique (Java, Python...).
            2. Ne pas répondre aux questions VRAIMENT hors sujet (Cuisine, Politique, Sport, Blagues).
            3. Ne pas inventer de chiffres.
            
            Si la question est technique (code) ou hors sujet (ex: cuisine), réponds :
            "🚫 Hors Sujet : Je suis un assistant spécialisé GreenTech."
            """;

    // --- 1. CHATBOT LOGIC (Auto Global Context) ---

    public String askAI(String userMessage, List<Map<String, String>> history) {
        String globalContext = getGlobalContextJson();
        String dynamicPrompt = String.format(SYSTEM_PROMPT_TEMPLATE, globalContext);
        return callDeepSeek(dynamicPrompt, userMessage, history);
    }

    private String getGlobalContextJson() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0);
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDateTime endOfLastMonth = startOfMonth.minusSeconds(1);

        double elecVal = getSum("ENERGY", startOfMonth, now);
        double gasVal = getSum("GAS", startOfMonth, now);
        double transVal = getSum("TRANSPORT", startOfMonth, now);
        double wasteVal = getSum("WASTE", startOfMonth, now);

        double lastElecVal = getSum("ENERGY", startOfLastMonth, endOfLastMonth);
        String elecTrend = calculateTrend(elecVal, lastElecVal);

        double elecCo2 = getSumCo2("ENERGY", startOfMonth, now);
        double gasCo2 = getSumCo2("GAS", startOfMonth, now);
        double transCo2 = getSumCo2("TRANSPORT", startOfMonth, now);
        double wasteCo2 = getSumCo2("WASTE", startOfMonth, now);

        // C. Top Consumer
        String topConsumer = "Inconnu";
        List<TopConsumerStats> tops = repository.findTopConsumer(startOfMonth);
        if (!tops.isEmpty()) topConsumer = tops.get(0).getLocation();

        long errors = repository.countByStatusAndTimestampAfter("ERROR", startOfMonth);
        long warnings = repository.countByStatusAndTimestampAfter("WARNING", startOfMonth);
        String iotStatus = (errors == 0 && warnings == 0) ? "EXCELLENT (Aucune alerte)" : "ATTENTION REQUISE";

        return String.format("""
        {
            "ELECTRICITE": {
                "Consommation_Ce_Mois": "%.2f kWh",
                "Consommation_Mois_Dernier": "%.2f kWh",
                "Tendance": "%s",
                "Coût_Estime": "%.2f MAD",
                "Empreinte_Carbone": "%.2f kg CO2", 
                "Top_Consommateur": "%s"
            },
            "GAZ": {
                "Consommation": "%.2f m3",
                "Coût_Estime": "%.2f MAD",
                "Empreinte_Carbone": "%.2f kg CO2"
            },
            "TRANSPORT": {
                "Distance": "%.2f km",
                "Empreinte_Carbone": "%.2f kg CO2"
            },
            "DECHETS": {
                "Poids": "%.2f kg",
                "Empreinte_Carbone": "%.2f kg CO2"
            },
            "ETAT_IOT": { 
                "Statut_Global": "%s",
                "Alertes_Critiques": "%d"
            }
        }
        """,
                elecVal, lastElecVal, elecTrend, (elecVal * COST_ELEC), elecCo2, topConsumer, // ✅ الترتيب تبدل هنا
                gasVal, (gasVal * COST_GAS), gasCo2,
                transVal, transCo2,
                wasteVal, wasteCo2,
                iotStatus, errors
        );
    }

    // --- 2. FRONTEND STATS LOGIC (Cards) ---
//    public AISummaryDTO generateDashboardStats() {
//        LocalDateTime now = LocalDateTime.now();
//        LocalDateTime startOfCurrentMonth = now.withDayOfMonth(1).withHour(0).withMinute(0);
//        LocalDateTime startOfLastMonth = startOfCurrentMonth.minusMonths(1);
//        LocalDateTime endOfLastMonth = startOfCurrentMonth.minusSeconds(1);
//
//        Double currentEnergy = getSum("ENERGY", startOfCurrentMonth, now);
//        Double lastEnergy = getSum("ENERGY", startOfLastMonth, endOfLastMonth);
//
//        String trend;
//        if (lastEnergy == 0) {
//            trend = "0%";
//        } else {
//            double percentChange = ((currentEnergy - lastEnergy) / lastEnergy) * 100;
//            trend = (percentChange > 0 ? "+" : "") + String.format("%.1f", percentChange) + "%";
//        }
//
//        Double totalCo2 = getSumCo2("ENERGY", startOfCurrentMonth, now) +
//                getSumCo2("GAS", startOfCurrentMonth, now) +
//                getSumCo2("TRANSPORT", startOfCurrentMonth, now) +
//                getSumCo2("WASTE", startOfCurrentMonth, now);
//
//        long totalWaste = repository.countByDataTypeAndTimestampAfter("WASTE", startOfCurrentMonth);
//        long recycledWaste = repository.countByDataTypeAndWasteTypeAndTimestampAfter("WASTE", "recyclable", startOfCurrentMonth);
//        double recyclingRate = (totalWaste > 0) ? ((double) recycledWaste / totalWaste) * 100 : 0.0;
//
//        return AISummaryDTO.builder()
//                .currentMonthEnergy(currentEnergy)
//                .lastMonthEnergy(lastEnergy)
//                .energyTrend(trend)
//                .totalCo2(totalCo2)
//                .recyclingRate(recyclingRate)
//                .estimatedCost(currentEnergy * COST_ELEC)
//                .build();
//    }

    // --- HELPERS ---

    private double getSum(String type, LocalDateTime start, LocalDateTime end) {
        Double val = repository.sumValueByDataTypeAndDateRange(type, start, end);
        return val != null ? val : 0.0;
    }

    private double getSumCo2(String type, LocalDateTime start, LocalDateTime end) {
        Double val = repository.sumCo2ByDataTypeAndDateRange(type, start, end);
        return val != null ? val : 0.0;
    }

    private String callDeepSeek(String systemPrompt, String userMsg, List<Map<String, String>> history) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("stream", false);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        if (history != null) {
            for (Map<String, String> msg : history) {
                messages.add(Map.of("role", msg.get("role"), "content", msg.get("content")));
            }
        }

        messages.add(Map.of("role", "user", "content", userMsg));
        body.put("messages", messages);

        try {
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            Map<String, Object> response = restTemplate.postForObject(apiUrl, entity, Map.class);

            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> messageObj = (Map<String, Object>) choices.get(0).get("message");
                    return (String) messageObj.get("content");
                }
            }
            return "Désolé, pas de réponse.";
        } catch (Exception e) {
            return "Erreur API: " + e.getMessage();
        }
    }
    private String calculateTrend(double current, double last) {
        if (last == 0) return "N/A";
        double percent = ((current - last) / last) * 100;
        return String.format("%+.1f%%", percent);
    }
}