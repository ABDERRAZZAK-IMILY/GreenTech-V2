package com.greentechinnovators.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greentechinnovators.backend.dto.ai.RecommendationResponse;
import com.greentechinnovators.backend.service.ai.AiContextManager;
import com.greentechinnovators.backend.service.ai.DeepSeekClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final AiContextManager aiContextManager;
    private final DeepSeekClient deepSeekClient;
    private final ObjectMapper objectMapper;

    public RecommendationResponse generateRecommendations() {
        // 1. Récupérer les données réelles
        String contextData = aiContextManager.getGlobalContextJson();

        // 2. Prompt (Notez le %% pour échapper le pourcentage)
        String prompt = """
            RÔLE : Expert en Audit Énergétique & Développement Durable.
            CONTEXTE CLIENT (Données réelles) : %s
            
            TÂCHE : Génère 3 recommandations concrètes (1 Facile, 1 Moyenne, 1 Difficile) basées sur ces données.
            
            RÈGLES IMPORTANTES :
            1. Réponds UNIQUEMENT avec du JSON brut. Pas de markdown (```json), pas de texte avant ou après.
            2. Structure STRICTE ci-dessous.
            
            FORMAT DE RÉPONSE :
            {
              "actions": [
                {
                  "id": "slug-unique-anglais",
                  "title": "Titre court",
                  "icon": "nom icone FontAwesome sans préfixe (ex: sun, lightbulb, car)",
                  "description": "Explication courte (2 phrases max).",
                  "impact": {
                    "co2": "-X.X t CO2/an",
                    "cost": "-X MAD/an",
                    "difficulty": "Facile",
                    "time": "Temps de mise en place",
                    "investissement": "Coût estimé"
                  },
                  "steps": ["Étape 1", "Étape 2"],
                  "benefits": [
                    { "icon": "bolt", "label": "Gain Énergie", "value": "-XX%%" },
                    { "icon": "coins", "label": "Économie", "value": "XX MAD" }
                  ]
                }
              ]
            }
            """.formatted(contextData);

        // 3. Appel IA
        String rawJson = deepSeekClient.generate(prompt);

        // 4. Nettoyage Robuste (Garde uniquement ce qu'il y a entre { et })
        String cleanJson = extractJson(rawJson);

        try {
            return objectMapper.readValue(cleanJson, RecommendationResponse.class);
        } catch (Exception e) {
            log.error("Erreur parsing Recommandations JSON. Raw: {}", rawJson, e);
            // Retourne une liste vide pour éviter le crash frontend
            RecommendationResponse emptyResponse = new RecommendationResponse();
            emptyResponse.setActions(Collections.emptyList());
            return emptyResponse;
        }
    }

    /**
     * Méthode utilitaire pour extraire le JSON même si l'IA bavarde autour.
     */
    private String extractJson(String response) {
        if (response == null) return "{}";
        response = response.trim();

        int firstBrace = response.indexOf("{");
        int lastBrace = response.lastIndexOf("}");

        if (firstBrace != -1 && lastBrace != -1) {
            return response.substring(firstBrace, lastBrace + 1);
        }
        return "{}"; // Echec, retourne un objet vide
    }
}