package com.greentechinnovators.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.greentechinnovators.backend.dto.AI.TopConsumerStats;
import com.greentechinnovators.backend.repository.SmartDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
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
    private final WebClient.Builder webClientBuilder;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String SYSTEM_PROMPT_TEMPLATE = """
    Tu es l'assistant IA de 'GreenTech Innovators'.
    
    🚨 RÔLE & LANGUE :
    - Tu es un expert en efficacité énergétique.
    - Tu parles par défaut en Français.
    - ✅ SI l'utilisateur te parle en Darija (Marocain) ou demande "bdarija", TU DOIS répondre en Darija.
    
    📝 RÈGLES DE FORMATAGE (RÉPONSE COURTE ET CLAIRE):
    1. **Structure :** Utilise des sauts de ligne (\n) pour séparer chaque idée. Ne fais jamais de blocs de texte compacts.
    2. **Titres :** Utilise **Titre** pour les titres. IMPORTANT : Mets toujours le titre sur sa propre ligne, avec une ligne vide avant et après.
    3. **Listes :** Utilise des tirets ("- ") pour les listes. Chaque point doit être sur une nouvelle ligne.
    4. **Simplicité :** Évite les caractères spéciaux inutiles comme "****" ou les lignes de séparation excessives "---".
    
    ℹ️ CONTEXTE :
    - Projet : GreenTech Innovators (Réduction empreinte carbone & coûts).
    - Objectif : -20%% coûts, -50%% CO2 d'ici 2030.
    
    📊 DONNÉES TEMPS RÉEL :
    %s
    
    ⛔ INTERDICTIONS :
    1. Pas de code informatique.
    2. Pas de sujets hors contexte.
    3. Pas d'invention de chiffres.
    """;
    public Flux<String> askAIStream(String userMessage, List<Map<String, String>> history) {
        String globalContext = getGlobalContextJson();
        String dynamicPrompt = String.format(SYSTEM_PROMPT_TEMPLATE, globalContext);

        WebClient webClient = webClientBuilder.baseUrl(apiUrl).build();

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("stream", true);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", dynamicPrompt));

        if (history != null) {
            for (Map<String, String> msg : history) {
                messages.add(Map.of("role", msg.get("role"), "content", msg.get("content")));
            }
        }
        messages.add(Map.of("role", "user", "content", userMessage));
        body.put("messages", messages);

        return webClient.post()
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(String.class)
                .map(this::extractContentFromDeepSeek)
                .filter(content -> !content.isEmpty());
    }

    // switch JSON to word
    private String extractContentFromDeepSeek(String jsonChunk) {
        try {
            if (jsonChunk.contains("[DONE]")) return "";

            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(jsonChunk);

            if (rootNode.has("choices") && rootNode.get("choices").isArray()) {
                JsonNode choice = rootNode.get("choices").get(0);
                if (choice.has("delta") && choice.get("delta").has("content")) {
                    return choice.get("delta").get("content").asText();
                }
            }
        } catch (Exception e) {
        }
        return "";
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

        //calcul defrence enter this Month and last Month
        double lastElecVal = getSum("ENERGY", startOfLastMonth, endOfLastMonth);
        String elecTrend = calculateTrend(elecVal, lastElecVal);

        //CO2
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
                elecVal, lastElecVal, elecTrend, (elecVal * COST_ELEC), elecCo2, topConsumer,
                gasVal, (gasVal * COST_GAS), gasCo2,
                transVal, transCo2,
                wasteVal, wasteCo2,
                iotStatus, errors
        );
    }

    private double getSum(String type, LocalDateTime start, LocalDateTime end) {
        Double val = repository.sumValueByDataTypeAndDateRange(type, start, end);
        return val != null ? val : 0.0;
    }

    private double getSumCo2(String type, LocalDateTime start, LocalDateTime end) {
        Double val = repository.sumCo2ByDataTypeAndDateRange(type, start, end);
        return val != null ? val : 0.0;
    }

//    private String callDeepSeek(String systemPrompt, String userMsg, List<Map<String, String>> history) {
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//        headers.setBearerAuth(apiKey);
//
//        Map<String, Object> body = new HashMap<>();
//        body.put("model", model);
//        body.put("stream", false);
//
//        List<Map<String, String>> messages = new ArrayList<>();
//        messages.add(Map.of("role", "system", "content", systemPrompt));
//
//        if (history != null) {
//            for (Map<String, String> msg : history) {
//                messages.add(Map.of("role", msg.get("role"), "content", msg.get("content")));
//            }
//        }
//
//        messages.add(Map.of("role", "user", "content", userMsg));
//        body.put("messages", messages);
//
//        try {
//            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
//            Map<String, Object> response = restTemplate.postForObject(apiUrl, entity, Map.class);
//
//            if (response != null && response.containsKey("choices")) {
//                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
//                if (!choices.isEmpty()) {
//                    Map<String, Object> messageObj = (Map<String, Object>) choices.get(0).get("message");
//                    return (String) messageObj.get("content");
//                }
//            }
//            return "Désolé, pas de réponse.";
//        } catch (Exception e) {
//            return "Erreur API: " + e.getMessage();
//        }
//    }
    private String calculateTrend(double current, double last) {
        if (last == 0) return "N/A";
        double percent = ((current - last) / last) * 100;
        return String.format("%+.1f%%", percent);
    }
}