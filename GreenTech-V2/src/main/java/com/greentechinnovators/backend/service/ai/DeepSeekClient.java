package com.greentechinnovators.backend.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DeepSeekClient {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${spring.ai.deepseek.api-key}")
    private String apiKey;

    @Value("${spring.ai.deepseek.base-url}")
    private String apiUrl;

    @Value("${spring.ai.deepseek.model}")
    private String model;


    public String generate(String prompt) {
        WebClient webClient = webClientBuilder.baseUrl(apiUrl).build();

        Map<String, Object> body = Map.of(
                "model", model,
                "stream", false,
                "temperature", 0.1,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        try {
            JsonNode response = webClient.post()
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response != null && response.has("choices")) {
                return response.path("choices").get(0).path("message").path("content").asText();
            }
        } catch (Exception e) {
            log.error("Erreur appel DeepSeek Synchronous", e);
        }
        return "{}";
    }


    public Flux<String> streamChat(List<Map<String, String>> messages) {
        WebClient webClient = webClientBuilder.baseUrl(apiUrl).build();

        Map<String, Object> body = Map.of(
                "model", model,
                "stream", true,
                "temperature", 0.7,
                "messages", messages
        );

        return webClient.post()
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(String.class)
                .map(this::extractStreamContent)
                .filter(content -> !content.isEmpty());
    }

    private String extractStreamContent(String jsonChunk) {
        try {
            if (jsonChunk.contains("[DONE]")) return "";
            JsonNode root = objectMapper.readTree(jsonChunk);
            return root.path("choices").get(0).path("delta").path("content").asText("");
        } catch (Exception e) {
            return "";
        }
    }
}