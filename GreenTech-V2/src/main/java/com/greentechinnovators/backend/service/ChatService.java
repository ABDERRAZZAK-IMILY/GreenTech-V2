package com.greentechinnovators.backend.service.ai;

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
    ... (Reste du prompt) ...
    📊 DONNÉES TEMPS RÉEL :
    %s
    """;

    public Flux<String> askAIStream(String userMessage, List<Map<String, String>> history) {
        // 1. Jib Context
        String jsonContext = contextManager.getGlobalContextJson();

        // 2. Sawb Prompt
        String systemPrompt = String.format(SYSTEM_PROMPT_TEMPLATE, jsonContext);

        // 3. 9ad l'historique
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        if (history != null) messages.addAll(history);
        messages.add(Map.of("role", "user", "content", userMessage));

        // 4. Sift l Client
        return deepSeekClient.streamChat(messages);
    }
}