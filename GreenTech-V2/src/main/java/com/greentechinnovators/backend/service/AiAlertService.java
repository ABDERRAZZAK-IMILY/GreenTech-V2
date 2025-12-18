package com.greentechinnovators.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.greentechinnovators.backend.dto.ai.AiAlertDTO;
import com.greentechinnovators.backend.service.ai.AiContextManager;
import com.greentechinnovators.backend.service.ai.AiPromptStore;
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

    private final AiContextManager contextManager;
    private final DeepSeekClient deepSeekClient;
    private final ObjectMapper objectMapper;
    private final AiPromptStore aiPromptStore;

    public List<AiAlertDTO> generateSmartAlerts() {
        String globalContext = contextManager.getGlobalContextJson();

        String prompt = aiPromptStore.buildAlertPrompt(globalContext);

        String jsonResponse = deepSeekClient.generate(prompt);

        return parseAiResponse(jsonResponse);
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