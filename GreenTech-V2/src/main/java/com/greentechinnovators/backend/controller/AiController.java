package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.ai.AiAlertDTO;
import com.greentechinnovators.backend.dto.ai.PredictionResponse;
import com.greentechinnovators.backend.dto.ai.RecommendationResponse;
import com.greentechinnovators.backend.service.AiAlertService;
import com.greentechinnovators.backend.service.ChatService;
import com.greentechinnovators.backend.service.PredictionService;
import com.greentechinnovators.backend.service.RecommendationService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final ChatService aiService;
    private final PredictionService generatePredictions;
    private final RecommendationService recommendationService;
    private final AiAlertService aiAlertService;

    public AiController(ChatService aiService, PredictionService generatePredictions, RecommendationService recommendationService, AiAlertService aiAlertService) {
        this.aiService = aiService;
        this.generatePredictions = generatePredictions;
        this.recommendationService = recommendationService;
        this.aiAlertService = aiAlertService;
    }


    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chatStream(@RequestBody Map<String, Object> payload) {
        String userMessage = (String) payload.get("message");
        List<Map<String, String>> history = (List<Map<String, String>>) payload.get("history");

        return aiService.askAIStream(userMessage, history);
    }

    @GetMapping("/predictions")
    public PredictionResponse getPredictions() {
        return generatePredictions.generatePredictions();
    }

    @GetMapping("/recommendations")
    public ResponseEntity<RecommendationResponse> getRecommendations() {
        return ResponseEntity.ok(recommendationService.generateRecommendations());
    }


    @GetMapping("/alerts")
    public ResponseEntity<List<AiAlertDTO>> getAiGeneratedAlerts() {
        List<AiAlertDTO> alerts = aiAlertService.generateSmartAlerts();
        return ResponseEntity.ok(alerts);
    }
}
