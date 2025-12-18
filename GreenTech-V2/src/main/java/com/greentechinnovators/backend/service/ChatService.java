package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.service.ai.AiContextManager;
import com.greentechinnovators.backend.service.ai.DeepSeekClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.greentechinnovators.backend.service.ai.AiPromptStore.SYSTEM_PROMPT_TEMPLATE;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final AiContextManager contextManager;
    private final DeepSeekClient deepSeekClient;



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