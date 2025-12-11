package com.greentechinnovators.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.greentechinnovators.backend.dto.AI.DailyStat;
import com.greentechinnovators.backend.dto.AI.PredictionResponse;
import com.greentechinnovators.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private final EnergyRepository energyRepository;
    private final GasRepository gasRepository;
    private final TrashRepository trashRepository;
    private final VehicleLogRepository vehicleLogRepository;

    private final WebClient.Builder webClientBuilder;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spring.ai.deepseek.api-key}")
    private String apiKey;

    @Value("${spring.ai.deepseek.base-url}")
    private String apiUrl;

    @Value("${spring.ai.deepseek.model}")
    private String model;

    // Constants (Prix & CO2)
    private static final double COST_ELEC = 1.2; // MAD/kWh
    private static final double COST_GAS = 10.5; // MAD/m3

    // Facteurs CO2 (Estimations)
    private static final double CO2_ELEC = 0.7;  // kg CO2/kWh
    private static final double CO2_GAS = 2.0;   // kg CO2/m3
    private static final double CO2_TRASH = 0.5; // kg CO2/kg
    private static final double CO2_TRANS = 0.15; // kg CO2/km
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
        if (history != null) messages.addAll(history);
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


    public PredictionResponse generatePredictions() {
        String context = getGlobalContextJson();
        String prompt = """
            Analyse les données suivantes et prédis la consommation du mois prochain.
            DONNÉES ACTUELLES :
            %s
            
            RÈGLE STRICTE : Réponds UNIQUEMENT avec ce format JSON exact :
            {
                "electricite": { "valeurPrincipale": "X kWh", "pourcentage": "+X%%", "coutPrevu": "X MAD", "emissionCo2": "X t CO2" },
                "gaz": { "valeurPrincipale": "X m3", "pourcentage": "+X%%", "coutPrevu": "X MAD", "emissionCo2": "X kg CO2" },
                "transport": { "valeurPrincipale": "X km", "pourcentage": "+X%%", "coutPrevu": "X MAD", "emissionCo2": "X t CO2" },
                "dechets": { "valeurPrincipale": "X kg", "pourcentage": "+X%%", "coutPrevu": "X MAD", "emissionCo2": "X kg CO2" }
            }
        """.formatted(context);

        String rawJson = callDeepSeek(prompt);
        String cleanJson = rawJson.replace("```json", "").replace("```", "").trim();

        PredictionResponse response;
        try {
            response = new ObjectMapper().readValue(cleanJson, PredictionResponse.class);
        } catch (Exception e) {
            log.error("Erreur parsing Prediction", e);
            response = new PredictionResponse();
        }

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(6).withHour(0).withMinute(0).withSecond(0).withNano(0);

        if (response.getElectricite() != null) {
            List<DailyStat> stats = energyRepository.getLast7DaysStats(sevenDaysAgo);
            response.getElectricite().setHistory(getHistoryData(stats));
        }

        if (response.getGaz() != null) {
            List<DailyStat> stats = gasRepository.getLast7DaysStats(sevenDaysAgo);
            response.getGaz().setHistory(getHistoryData(stats));
        }

        if (response.getTransport() != null) {
            List<DailyStat> stats = vehicleLogRepository.getLast7DaysStats(sevenDaysAgo);
            response.getTransport().setHistory(getHistoryData(stats));
        }

        if (response.getDechets() != null) {
            List<DailyStat> stats = trashRepository.getLast7DaysStats(sevenDaysAgo);
            response.getDechets().setHistory(getHistoryData(stats));
        }

        return response;
    }

    private String getGlobalContextJson() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0);
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);

        // 1. Récupérer les valeurs cumulées (Ce mois)
        double elecVal = safeGet(energyRepository.sumValueByCreatedAtAfter(startOfMonth));
        double gasVal = safeGet(gasRepository.sumValueByCreatedAtAfter(startOfMonth));
        double wasteVal = safeGet(trashRepository.sumWeightByCreatedAtAfter(startOfMonth));
        double transVal = safeGet(vehicleLogRepository.sumDistanceByCreatedAtAfter(startOfMonth));

        // 2. Calculer Tendance (Astuce: Total depuis mois dernier - Total ce mois = Total mois dernier)
        double elecLastVal = safeGet(energyRepository.sumValueByCreatedAtAfter(startOfLastMonth)) - elecVal;
        String elecTrend = calculateTrend(elecVal, elecLastVal);

        // 3. Calculer CO2 et Coûts
        double elecCo2 = elecVal * CO2_ELEC;
        double gasCo2 = gasVal * CO2_GAS;
        double transCo2 = transVal * CO2_TRANS;
        double wasteCo2 = wasteVal * CO2_TRASH;

        // 4. Top Consumer
        String topConsumer = "Usine Principale"; // Placeholder ou appel repository spécifique

        return String.format("""
        {
            "ELECTRICITE": { "Conso": "%.2f kWh", "Trend": "%s", "Cout": "%.2f MAD", "CO2": "%.2f kg" },
            "GAZ": { "Conso": "%.2f m3", "Cout": "%.2f MAD", "CO2": "%.2f kg" },
            "TRANSPORT": { "Distance": "%.2f km", "CO2": "%.2f kg" },
            "DECHETS": { "Poids": "%.2f kg", "CO2": "%.2f kg" }
        }
        """,
                elecVal, elecTrend, (elecVal * COST_ELEC), elecCo2,
                gasVal, (gasVal * COST_GAS), gasCo2,
                transVal, transCo2,
                wasteVal, wasteCo2
        );
    }


    private double safeGet(Double val) {
        return val != null ? val : 0.0;
    }

    private String calculateTrend(double current, double last) {
        if (last == 0) return "+0%";
        double percent = ((current - last) / last) * 100;
        return String.format("%+.1f%%", percent);
    }

    // Appel API Non-Streaming (RestTemplate)
    private String callDeepSeek(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("stream", false);
        body.put("messages", List.of(Map.of("role", "user", "content", prompt)));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        try {
            Map<String, Object> response = restTemplate.postForObject(apiUrl, entity, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> msg = (Map<String, Object>) choices.get(0).get("message");
            return (String) msg.get("content");
        } catch (Exception e) {
            return "{}";
        }
    }

    // Parsing Stream (WebClient)
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
        } catch (Exception e) {}
        return "";
    }


    private List<Double> getHistoryData(List<DailyStat> dbStats) {

        Map<String, Double> statsMap = new HashMap<>();
        for (DailyStat stat : dbStats) {
            statsMap.put(stat.getDate(), stat.getTotal());
        }

        List<Double> history = new ArrayList<>();


        LocalDateTime dateIter = LocalDateTime.now().minusDays(6).withHour(0).withMinute(0).withSecond(0).withNano(0);

        for (int i = 0; i < 7; i++) {
            String key = dateIter.toLocalDate().toString();

            history.add(statsMap.getOrDefault(key, 0.0));

            dateIter = dateIter.plusDays(1);
        }

        return history;
    }
}