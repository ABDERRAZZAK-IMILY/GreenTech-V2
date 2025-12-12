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
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

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

    // Constants (Prix)
    private static final double COST_ELEC = 1.2; // MAD/kWh
    private static final double COST_GAS = 10.5; // MAD/m3

    // ⚠️ Remarque : SYSTEM_PROMPT_TEMPLATE bqa kima kan.

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
//        LocalDateTime now = LocalDateTime.now();
//        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0);
//        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);

        LocalDate startOfMonthDate = LocalDate.now().withDayOfMonth(1);
        LocalDate startOfLastMonthDate = startOfMonthDate.minusMonths(1);
        LocalDate nowDate = LocalDate.now();

        // Convertir en LocalDateTime pour les appels nécessitant des timestamps
        LocalDateTime startOfMonth = startOfMonthDate.atStartOfDay();
        LocalDateTime startOfLastMonth = startOfLastMonthDate.atStartOfDay();
        LocalDateTime now = nowDate.atTime(LocalTime.MAX);


        //double elecVal = energyService.getConsumedKwhBetweenDates(startOfMonth, now);
        //double gasVal = gasService.sumValueByCreatedAtBetween(startOfMonth, now);
        //double wasteVal = trashService.getConsumeTrashBetweenDates(startOfMonth, now);
        List<DailyDistanceDTO> dailyDistanceDTOS =
                vehicleLogService.getDistanceHistory(startOfMonth, now);

        System.out.println("=============================> " +
                dailyDistanceDTOS.stream()
                        .map(DailyDistanceDTO::getTotalDistanceKm)
                        .toList()
        );

        return dailyDistanceDTOS.toString();

        // 2. Récupérer les valeurs du mois dernier (Pour que l'AI calcule la Tendance)
//        double elecLastVal = energyService.getConsumedKwhBetweenDates(startOfLastMonth, startOfMonth);
//        double wasteLastVal = trashService.getConsumeTrashBetweenDates(startOfLastMonth, startOfMonth);
        //double gasLastVal = gasService.sumValueByCreatedAtBetween(startOfLastMonth, startOfMonth.minusNanos(1));
        //double transLastVal = vehicleLogService.sumDistanceByCreatedAtBetween(startOfLastMonth, startOfMonth.minusNanos(1));

        // 3. Calculer CO2 et Coûts
        // ✅ Utilisation de CarbonFootprintService l'l'calcul
//        double elecCo2 = carbonFootprintService.calculateEnergyFootprint(elecVal);
//        double wasteCo2 = carbonFootprintService.calculateTrashFootprint(wasteVal);
        //double gasCo2 = carbonFootprintService.calculateGasFootprint(gasVal);
//        double transCo2 = carbonFootprintService.calculateTransportFootprint(transVal);

//        double elecCost = elecVal * COST_ELEC;
        //double gasCost = gasVal * COST_GAS;

        // 4. Retourner le JSON (M'kammal w m'qadd)
//        "GAZ": {
//            "Conso": "%.2f kg",
//                    "LastMonthConso": "%.2f kg",
//                    "Cout": "%.2f MAD",
//                    "CO2": "%.2f kg"
//        },
//
//        return String.format("""
//        {
//            "ELECTRICITE": {
//                "Conso": "%.2f kWh",
//                "LastMonthConso": "%.2f kWh",
//                "Cout": "%.2f MAD",
//                "CO2": "%.2f kg"
//            },
//            "DECHETS": {
//                "Poids": "%.2f kg",
//                "LastMonthPoids": "%.2f kg",
//                "CO2": "%.2f kg"
//            },
//             "TRANSPORT": {
//                    "Distance": "%.2f km",
//                    "LastMonthDistance": "%.2f km",
//                    "CO2": "%.2f kg"
//             },
//        }
//        """
                // ELECTRICITE
//                 elecLastVal,
                // GAZ
                //gasVal, gasLastVal, gasCost, gasCo2,
                // TRANSPORT
                //transVal, transLastVal, transCo2,
                // DECHETS
//                 wasteLastVal
//        );
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

    public List<DailyDistanceDTO> test() {

        LocalDate startOfMonthDate = LocalDate.now().withDayOfMonth(1);
        LocalDate nowDate = LocalDate.now();
        LocalDateTime startOfMonth = startOfMonthDate.atStartOfDay();
        LocalDateTime now = nowDate.atTime(LocalTime.MAX);


        List<DailyDistanceDTO> dailyDistanceDTOS = vehicleLogService.getDistanceHistory(startOfMonth, now);

        System.out.println("Result Size: " + dailyDistanceDTOS.size());

        // 4. Return the VARIABLE (not the class name)
        return dailyDistanceDTOS;
    }
}