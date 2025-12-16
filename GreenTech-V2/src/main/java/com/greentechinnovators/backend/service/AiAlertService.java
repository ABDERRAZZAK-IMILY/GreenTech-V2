package com.greentechinnovators.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.greentechinnovators.backend.dto.ai.AiAlertDTO;
import com.greentechinnovators.backend.service.ai.AiContextManager;
import com.greentechinnovators.backend.service.ai.DeepSeekClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiAlertService {

    private final AiContextManager contextManager; // Ton code précédent
    private final DeepSeekClient deepSeekClient;   // Ton code précédent
    private final ObjectMapper objectMapper;

    public List<AiAlertDTO> generateSmartAlerts() {
        String globalContext = contextManager.getGlobalContextJson();

        String prompt = buildAlertPrompt(globalContext);

        String jsonResponse = deepSeekClient.generate(prompt);

        return parseAiResponse(jsonResponse);
    }

    private String buildAlertPrompt(String contextData) {
        return """
            Tu es un système de surveillance IoT intelligent pour GreenTech.
            
            CONTEXTE (Données actuelles) :
            %s
            
            TA MISSION :
            Analyse ces données pour détecter des anomalies, des gaspillages ou des problèmes techniques.
            Génère une liste d'alertes au format JSON strict.
            
            RÈGLES D'ALERTES :
            - Si Consommation Energy > Moyenne mois dernier -> Type: 'warning', Icon: 'fa-bolt'
            - Si CO2 Transport augmente -> Type: 'critical', Icon: 'fa-smog'
            - Si Déchets > Seuil -> Type: 'warning', Icon: 'fa-trash'
            - Si tout est normal -> Génère une alerte 'info' : "Systèmes nominaux".
            
            FORMAT DE SORTIE ATTENDU (JSON Array uniquement) :
            [
              {
                "id": 1,
                "type": "critical", // ou warning, offline, info
                "icon": "fa-fire",  // Choisir une icône FontAwesome adaptée
                "title": "Titre court",
                "location": "Description précise du problème et de la valeur",
                "time": "À l'instant"
              }
            ]
            """.formatted(contextData);
    }

    private List<AiAlertDTO> parseAiResponse(String jsonResponse) {
        try {
            String cleanJson = jsonResponse.replace("```json", "").replace("```", "").trim();

            if (!cleanJson.startsWith("[")) {
                log.warn("L'IA n'a pas renvoyé un tableau JSON valide : {}", cleanJson);
                return Collections.emptyList();
            }

            return objectMapper.readValue(cleanJson, new TypeReference<List<AiAlertDTO>>() {});
        } catch (Exception e) {
            log.error("Erreur parsing JSON des alertes AI", e);
            return Collections.emptyList();
        }
    }
}