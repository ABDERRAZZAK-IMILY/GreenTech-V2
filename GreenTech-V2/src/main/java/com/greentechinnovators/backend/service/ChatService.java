package com.greentechinnovators.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.greentechinnovators.backend.dto.vehicle.responce.DailyDistanceDTO;
import com.greentechinnovators.backend.mapper.VehicleMapper;
import com.greentechinnovators.backend.utils.CarbonFootprintService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.DoubleStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final EnergyService energyService;
    private final GasService gasService;
    private final TrashService trashService;
    private final VehicleService vehicleLogService;
    private final CarbonFootprintService carbonFootprintService;

    private final WebClient.Builder webClientBuilder;

    @Value("${spring.ai.deepseek.api-key}")
    private String apiKey;

    @Value("${spring.ai.deepseek.base-url}")
    private String apiUrl;

    @Value("${spring.ai.deepseek.model}")
    private String model;


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
        String globalContext = getChatContextJson();
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


    private String getChatContextJson() {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);

        LocalDate startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDate endOfLastMonth = startOfMonth.minusDays(1);


        // double elecVal = energyService.getConsumedKwhBetweenDates(startOfMonth, now);
        // double gasVal = gasService.sumValueByCreatedAtBetween(startOfMonth, now);
        // double wasteVal = trashService.getConsumeTrashBetweenDates(startOfMonth, now);


        List<DailyDistanceDTO> currentLogs = vehicleLogService.getDistanceHistory(startOfMonth, now);
        List<DailyDistanceDTO> lastMonthLogs = vehicleLogService.getDistanceHistory(startOfLastMonth, endOfLastMonth);

        double transVal = calculateTotalDistance(currentLogs);
        double transLastVal = calculateTotalDistance(lastMonthLogs);
        double transCo2 = calculateTotalCarbon(currentLogs);
        double transLastCo2 = calculateTotalCarbon(lastMonthLogs);

        return String.format(Locale.US, """
        {
             "TRANSPORT": {
                    "Distance": "%.2f km",
                    "LastMonthDistance": "%.2f km",
                    "CO2": "%.2f kg",
                    "LastMonthCO2" : "%.2f kg"
             }
        }
        """,
                transVal,
                transLastVal,
                transCo2,
                transLastCo2
        );
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

    private double calculateTotalDistance(List<DailyDistanceDTO> logs) {
        if (logs == null || logs.isEmpty()) {
            return 0.0;
        }
        return logs.stream()
                .mapToDouble(DailyDistanceDTO::getTotalDistanceKm)
                .sum();
    }

    private double calculateTotalCarbon(List<DailyDistanceDTO> logs) {
        if (logs == null || logs.isEmpty()) {
            return 0.0;
        }
        return logs.stream()
                .mapToDouble(DailyDistanceDTO::getCarbonFootprintKg)
                .sum();
    }
}