package com.greentechinnovators.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greentechinnovators.backend.dto.AI.DailyStat;
import com.greentechinnovators.backend.dto.AI.PredictionResponse;
import com.greentechinnovators.backend.repository.EnergyRepository;
import com.greentechinnovators.backend.repository.GasRepository;
import com.greentechinnovators.backend.repository.TrashRepository;
import com.greentechinnovators.backend.repository.VehicleLogRepository;
import com.greentechinnovators.backend.service.ai.AiContextManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class PredictionService {

    private final EnergyRepository energyRepository;
    private final GasRepository gasRepository;
    private final TrashRepository trashRepository;
    private final VehicleLogRepository vehicleLogRepository;

    private final AiContextManager aiContextManager;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${spring.ai.deepseek.api-key}")
    private String apiKey;

    @Value("${spring.ai.deepseek.base-url}")
    private String apiUrl;

    @Value("${spring.ai.deepseek.model}")
    private String model;

    // ✅ CONSTANTES DE PRIX (Modifier ici pour impacter le calcul)
    private static final double PRIX_ELEC = 1.20;       // MAD/kWh
    private static final double PRIX_GAZ = 12.50;       // MAD/kg
    private static final double PRIX_TRANSPORT = 14.00; // MAD/100km
    private static final double PRIX_DECHETS = 0.80;    // MAD/kg

    public PredictionResponse generatePredictions() {
        // 1. Récupération du contexte
        String contextJson = aiContextManager.getGlobalContextJson();

        // 2. Prompt Dynamique (Incorpore les Prix et le Contexte)
        String prompt = """
    RÔLE : Expert en Audit Énergétique Industriel & Prévision IA.
    TÂCHE : Prédire la consommation et les coûts du MOIS PROCHAIN (N+1).

    PARAMÈTRES DE COÛT (Utilise ces valeurs pour calculer 'coutPrevu') :
    - Électricité : %.2f MAD / kWh
    - Gaz (LPG)   : %.2f MAD / kg
    - Transport   : %.2f MAD / 100 km
    - Déchets     : %.2f MAD / kg

    DONNÉES D'ENTRÉE (Mois en cours vs Mois Précédent) :
    %s

    RÈGLES STRICTES :
    1. Réponds UNIQUEMENT avec un JSON valide.
    2. PAS de Markdown, PAS d'intro/outro.
    3. Pour 'pourcentage', utilise le format "+X%%" ou "-X%%".
    4. Si une donnée historique manque pour le pourcentage, mets "N/A".

    FORMAT JSON ATTENDU :
    {
        "electricite": { "valeurPrincipale": "X kWh", "pourcentage": "+X%%", "coutPrevu": "X MAD", "emissionCo2": "X kg CO2" },
        "gaz": { "valeurPrincipale": "X kg", "pourcentage": "+X%%", "coutPrevu": "X MAD", "emissionCo2": "X kg CO2" },
        "transport": { "valeurPrincipale": "X km", "pourcentage": "+X%%", "coutPrevu": "X MAD", "emissionCo2": "X kg CO2" },
        "dechets": { "valeurPrincipale": "X kg", "pourcentage": "+X%%", "coutPrevu": "X MAD", "emissionCo2": "X kg CO2" }
    }
""".formatted(PRIX_ELEC, PRIX_GAZ, PRIX_TRANSPORT, PRIX_DECHETS, contextJson);

        // 3. Appel AI
        String rawJson = callDeepSeek(prompt);
        String cleanJson = rawJson.replace("```json", "").replace("```", "").trim();

        PredictionResponse response;
        try {
            response = objectMapper.readValue(cleanJson, PredictionResponse.class);
        } catch (Exception e) {
            log.error("Erreur parsing Prediction", e);
            response = new PredictionResponse();
        }

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(6).withHour(0).withMinute(0).withSecond(0).withNano(0);

        if (response.getElectricite() == null) response.setElectricite(new PredictionResponse.CategoryPrediction());
        response.getElectricite().setHistory(getHistoryData(energyRepository.getLast7DaysStats(sevenDaysAgo)));

        if (response.getGaz() == null) response.setGaz(new PredictionResponse.CategoryPrediction());
        response.getGaz().setHistory(getHistoryData(gasRepository.getLast7DaysStats(sevenDaysAgo)));

        if (response.getTransport() == null) response.setTransport(new PredictionResponse.CategoryPrediction());
        response.getTransport().setHistory(getHistoryData(vehicleLogRepository.getLast7DaysStats(sevenDaysAgo)));

        if (response.getDechets() == null) response.setDechets(new PredictionResponse.CategoryPrediction());
        response.getDechets().setHistory(getHistoryData(trashRepository.getLast7DaysStats(sevenDaysAgo)));

        return response;
    }

    private String callDeepSeek(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("stream", false);

        body.put("temperature", 0.1);

        body.put("messages", List.of(Map.of("role", "user", "content", prompt)));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        try {
            Map<String, Object> resp = restTemplate.postForObject(apiUrl, entity, Map.class);

            if (resp != null && resp.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) resp.get("choices");
                Map<String, Object> msg = (Map<String, Object>) choices.get(0).get("message");
                return (String) msg.get("content");
            }
            return "{}";
        } catch (Exception e) {
            log.error("AI Error", e);
            return "{}";
        }
    }

    private List<Double> getHistoryData(List<DailyStat> dbStats) {
        Map<String, Double> statsMap = new HashMap<>();
        if (dbStats != null) {
            for (DailyStat stat : dbStats) {
                statsMap.put(stat.getDate(), stat.getTotal());
            }
        }

        List<Double> history = new ArrayList<>();
        LocalDateTime dateIter = LocalDateTime.now().minusDays(6);

        for (int i = 0; i < 7; i++) {
            String key = dateIter.toLocalDate().toString();
            history.add(statsMap.getOrDefault(key, 0.0));
            dateIter = dateIter.plusDays(1);
        }
        return history;
    }
}