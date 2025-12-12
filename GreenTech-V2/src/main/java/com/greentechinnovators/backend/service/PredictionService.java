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

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PredictionService {


    private final EnergyRepository energyRepository;
    private final GasRepository gasRepository;
    private final TrashRepository trashRepository;
    private final VehicleLogRepository vehicleLogRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spring.ai.deepseek.api-key}")
    private String apiKey;

    @Value("${spring.ai.deepseek.base-url}")
    private String apiUrl;

    @Value("${spring.ai.deepseek.model}")
    private String model;

    // Constants (Prix & CO2)
    private static final double COST_ELEC = 1.2;
    private static final double COST_GAS = 10.5;
    private static final double CO2_ELEC = 0.7;
    private static final double CO2_GAS = 2.0;   // kg CO2/m3
    private static final double CO2_TRASH = 0.5; // kg CO2/kg
    private static final double CO2_TRANS = 0.15; // kg CO2/km


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

        // Utilisation des Repositories pour l'Historique (getLast7DaysStats)
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

    /**
     * Context for Production/Prediction (Uses Repositories) - Le code original
     */
    private String getGlobalContextJson() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0);
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);

        // 1. Récupérer les valeurs cumulées (Ce mois)
        double elecVal = safeGet(energyRepository.sumValueByCreatedAtAfter(startOfMonth));
        double gasVal = safeGet(gasRepository.sumValueByCreatedAtAfter(startOfMonth));
        double wasteVal = safeGet(trashRepository.sumWeightByCreatedAtAfter(startOfMonth));
        double transVal = safeGet(vehicleLogRepository.sumDistanceByCreatedAtAfter(startOfMonth));

        // 2. Calculer Tendance
        double elecLastVal = safeGet(energyRepository.sumValueByCreatedAtAfter(startOfLastMonth)) - elecVal;
        String elecTrend = calculateTrend(elecVal, elecLastVal);

        // 3. Calculer CO2 et Coûts
        double elecCo2 = elecVal * CO2_ELEC;
        double gasCo2 = gasVal * CO2_GAS;
        double transCo2 = transVal * CO2_TRANS;
        double wasteCo2 = wasteVal * CO2_TRASH;

        // 4. Top Consumer
        String topConsumer = "Usine Principale";

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