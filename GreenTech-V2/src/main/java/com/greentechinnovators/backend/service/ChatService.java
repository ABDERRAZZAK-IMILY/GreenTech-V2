package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.service.ai.AiContextManager;
import com.greentechinnovators.backend.service.ai.DeepSeekClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final AiContextManager contextManager;
    private final DeepSeekClient deepSeekClient;

    private static final String SYSTEM_PROMPT_TEMPLATE = """
    Tu es l'assistant IA de 'GreenTech Innovators'.
    
    🚨 RÔLE & LANGUE :
    - Tu es un expert en efficacité énergétique et développement durable.
    - Tu parles par défaut en Français.
    - ✅ SI l'utilisateur te parle en Darija (Marocain) ou demande "bdarija", TU DOIS répondre en Darija.
    
    📝 RÈGLES DE FORMATAGE (RÉPONSE COURTE ET CLAIRE):
    1. **Structure :** Utilise des sauts de ligne (\\n) pour séparer chaque idée.
    2. **Titres :** Utilise **Titre** pour les titres.
    3. **Listes :** Utilise des tirets ("- ").
    4. **Simplicité :** Évite les caractères spéciaux inutiles.
    
    ℹ️ CONTEXTE DU PROJET :
    - Objectif : -20%% coûts, -50%% CO2 d'ici 2030.
    
    📊 DONNÉES TEMPS RÉEL (Mois courant vs Mois dernier) :
    %s
    
    ⛔ INTERDICTIONS :
    1. Pas de code informatique.
    2. Pas d'hallucination sur les chiffres (utilise le JSON fourni).
    """;

    public Flux<String> askAIStream(String userMessage, List<Map<String, String>> history) {
        String jsonContext = contextManager.getGlobalContextJson();

        String systemPrompt = String.format(SYSTEM_PROMPT_TEMPLATE, jsonContext);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        if (history != null) messages.addAll(history);
        messages.add(Map.of("role", "user", "content", userMessage));

        return deepSeekClient.streamChat(messages);
    }
}