package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.AISummaryDTO;
import com.greentechinnovators.backend.dto.TopConsumerStats;
import com.greentechinnovators.backend.repository.SmartDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.bson.Document;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIService {

    @Value("${ai.deepseek.api-key:sk-435906190b884e668ac1e16c72634c17}") // ⚠️ خبي هاد الـ Key فـ properties
    private String apiKey;

    @Value("${ai.deepseek.base-url:https://api.deepseek.com/chat/completions}")
    private String apiUrl;

    @Value("${ai.deepseek.model:deepseek-chat}")
    private String model;

    private static final double ENERGY_COST_PER_KWH = 1.2;

    private final SmartDataRepository repository;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String SYSTEM_PROMPT_TEMPLATE = """
    Tu es l'assistant IA de 'GreenTech Innovators'.
    
    🚨 INSTRUCTION STRICTE :
    Tu dois répondre en utilisant les DONNÉES TEMPS RÉEL ci-dessous.
    
    === DONNÉES TEMPS RÉEL (Calculées maintenant) ===
    - Consommation Électrique : %s kWh
    - Département le plus énergivore : %s
    - Tendance par rapport au mois dernier : %s
    - Coût Estimé : %s MAD
    - Empreinte Carbone Totale : %s kg CO2
    - Taux de Recyclage : %s %%
    
    === BASE DE CONNAISSANCES FIXE (Règles & Conseils) ===
    1. ACTIONS : Éteindre veille (-8%%), LED (-60%%), Clim 24°C (-15%%).
    2. INVESTISSEMENTS : Solaire (ROI 5 ans), LED (ROI 18 mois).
    
    === GESTION DE CONVERSATION (IMPORTANT) ===
    Tu as accès à l'historique de la discussion.
    SI l'utilisateur pose une question courte ou de suivi (ex: "explique", "pourquoi ?", "c'est à dire ?", "détails", "oui"), TU DOIS :
    1. Regarder le message précédent dans l'historique.
    2. Fournir l'explication demandée en lien avec ce contexte.
    NE REFUSE PAS de répondre si la question est liée au message précédent, même si elle ne contient pas de mots-clés techniques.
    
    SI et SEULEMENT SI la question est totalement hors sujet (cuisine, blagues...), réponds :
    "Je suis désolé, je ne peux répondre qu'aux questions liées à GreenTech."
    
            SI l'utilisateur pose une question courte...
            
                FORMATTAGE DE LA RÉPONSE :
                - Utilise des **titres en gras** pour les sections.
                - Utilise des listes à puces (-) pour les détails.
                - Ajoute des émojis (📊, ⚡, 💰) pour rendre la lecture agréable.
                - Sois concis et structuré.
    """;

    public String askAI(String userMessage, List<Map<String, String>> history) {
        AISummaryDTO stats = generateDashboardStats();

        String dynamicPrompt = String.format(SYSTEM_PROMPT_TEMPLATE,
                String.format("%.2f", stats.getCurrentMonthEnergy()), // 1. Consommation
                stats.getTopConsumer(),                               // 2. Département (AJOUTÉ ICI)
                stats.getEnergyTrend(),                               // 3. Tendance
                String.format("%.2f", stats.getEstimatedCost()),      // 4. Coût
                String.format("%.2f", stats.getTotalCo2()),           // 5. CO2
                String.format("%.1f", stats.getRecyclingRate())
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("stream", false);

        List<Map<String, String>> messages = new ArrayList<>();

        messages.add(Map.of("role", "system", "content", dynamicPrompt));

        if (history != null) {
            for (Map<String, String> msg : history) {
                messages.add(Map.of("role", msg.get("role"), "content", msg.get("content")));
            }
        }

        messages.add(Map.of("role", "user", "content", userMessage));

        body.put("messages", messages);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(apiUrl, entity, Map.class);
            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> messageObj = (Map<String, Object>) choices.get(0).get("message");
                    return (String) messageObj.get("content");
                }
            }
            return "Désolé, problème IA.";
        } catch (Exception e) {
            return "Erreur: " + e.getMessage();
        }
    }

    public AISummaryDTO generateDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfCurrentMonth = now.withDayOfMonth(1).withHour(0).withMinute(0);
        LocalDateTime startOfLastMonth = startOfCurrentMonth.minusMonths(1);
        LocalDateTime endOfLastMonth = startOfCurrentMonth.minusSeconds(1);

        Double currentEnergy = repository.sumValueByDataTypeAndDateRange("ENERGY", startOfCurrentMonth, now);
        Double lastEnergy = repository.sumValueByDataTypeAndDateRange("ENERGY", startOfLastMonth, endOfLastMonth);

        double current = (currentEnergy != null) ? currentEnergy : 0.0;
        double last = (lastEnergy != null) ? lastEnergy : 0.0;

        String trend;
        if (last == 0) {
            trend = "0%";
        } else {
            double percentChange = ((current - last) / last) * 100;
            trend = (percentChange > 0 ? "+" : "") + String.format("%.1f", percentChange) + "%";
        }

        Double co2 = repository.sumTotalCo2Impact();
        double totalCo2 = (co2 != null) ? co2 : 0.0;

        long totalWaste = repository.countByDataTypeAndTimestampAfter("WASTE", startOfCurrentMonth);
        long recycledWaste = repository.countByDataTypeAndWasteTypeAndTimestampAfter("WASTE", "recyclable", startOfCurrentMonth);

        double recyclingRate = (totalWaste > 0) ? ((double) recycledWaste / totalWaste) * 100 : 0.0;

        double cost = current * ENERGY_COST_PER_KWH;

        List<TopConsumerStats> topConsumers = repository.findTopConsumer(startOfCurrentMonth);

        String topDep = "Inconnu";

        if (!topConsumers.isEmpty()) {
            topDep = topConsumers.get(0).getLocation();
        }

        return AISummaryDTO.builder()
                .currentMonthEnergy(current)
                .lastMonthEnergy(last)
                .energyTrend(trend)
                .totalCo2(totalCo2)
                .recyclingRate(recyclingRate)
                .estimatedCost(cost)
                .topConsumer(topDep)
                .build();
    }
}