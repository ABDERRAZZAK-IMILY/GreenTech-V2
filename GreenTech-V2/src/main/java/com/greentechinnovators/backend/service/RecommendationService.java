package com.greentechinnovators.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greentechinnovators.backend.dto.ai.RecommendationResponse;
import com.greentechinnovators.backend.service.ai.AiContextManager;
import com.greentechinnovators.backend.service.ai.AiPromptStore;
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
    private final AiPromptStore aiPromptStore;

    public RecommendationResponse generateRecommendations() {
        String contextData = aiContextManager.getGlobalContextJson();
        String prompt = aiPromptStore.getRecommendationPrompt(contextData);

        String rawJson = deepSeekClient.generate(prompt);

        String cleanJson = extractJson(rawJson);

        try {
            return objectMapper.readValue(cleanJson, RecommendationResponse.class);
        } catch (Exception e) {
            log.error("Erreur parsing Recommandations JSON. Raw: {}", rawJson, e);
            RecommendationResponse emptyResponse = new RecommendationResponse();
            emptyResponse.setActions(Collections.emptyList());
            return emptyResponse;
        }
    }


    private String extractJson(String response) {
        if (response == null) return "{}";
        response = response.trim();

        int firstBrace = response.indexOf("{");
        int lastBrace = response.lastIndexOf("}");

        if (firstBrace != -1 && lastBrace != -1) {
            return response.substring(firstBrace, lastBrace + 1);
        }
        return "{}";
    }
}