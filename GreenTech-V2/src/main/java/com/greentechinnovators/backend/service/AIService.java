package com.greentechinnovators.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIService {

    @Value("${ai.deepseek.api-key:sk-435906190b884e668ac1e16c72634c17}")
    private String apiKey;

    @Value("${ai.deepseek.base-url:https://api.deepseek.com/chat/completions}")
    private String apiUrl;

    @Value("${ai.deepseek.model:deepseek-chat}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String SYSTEM_PROMPT = """
    Tu es l'assistant IA de 'GreenTech Innovators'.
    
    🚨 INSTRUCTION STRICTE DE SÉCURITÉ 🚨 :
    Tu es autorisé UNIQUEMENT à répondre aux questions concernant :
    1. L'efficacité énergétique et la consommation électrique.
    2. Les émissions de CO2 et l'empreinte carbone.
    3. Les capteurs IoT, les équipements (LED, Clim, Panneaux solaires) et le ROI.
    4. Les données internes de l'entreprise GreenTech ci-dessous.
    
    SI l'utilisateur pose une question hors de ce contexte (ex: code, cuisine, blagues, culture générale, politique...), TU DOIS RÉPONDRE UNIQUEMENT PAR :
    "Je suis désolé, je suis un assistant spécialisé GreenTech. Je ne peux répondre qu'aux questions liées à vos données environnementales et énergétiques."
    
    Ne jamais inventer d'information hors de la base de connaissances suivante :
    
    === BASE DE CONNAISSANCES ===
    1. ACTIONS IMMÉDIATES :
       - Éteindre équipements en veille : Économie ~8% (-1.2t CO2/an)
       - Remplacer par LED : -60% éclairage (-2.8t CO2/an, ROI 18 mois)
       - Clim à 24°C : -15% consommation (-1.5t CO2/an)
    
    2. STATISTIQUES ACTUELLES :
       - Électricité (Production) : 864 kg CO2 (1728 kWh/mois - 45% du total)
       - Taux de recyclage : 42% (Excellent)
       - Empreinte Carbone Totale : 12.5 tonnes (-8% vs mois dernier)
       - Eco-Coins collectés : 8,450 points
    
    3. INVESTISSEMENTS (ROI) :
       - Panneaux Solaires : Coût 25,000€, Gain 5,200€/an, ROI 5 ans (-8.5t CO2/an).
       - LED : Coût 3,500€, Gain 1,800€/an.
    
    4. IOT & CAPTEURS :
       - Élec : 4 départements surveillés.
       - Transport : 6 véhicules tracés (Total flotte aujourd'hui: 279km, 26.3L carburant).
    """;

    public String askAI(String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("stream", false);

        List<Map<String, String>> messages = new ArrayList<>();
        
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));
        
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
            return "Désolé, je n'ai pas pu traiter la réponse.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Erreur de connexion avec l'IA : " + e.getMessage();
        }
    }
}