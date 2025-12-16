package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.ai.AiAlertDTO;
import com.greentechinnovators.backend.dto.ai.PredictionResponse;
import com.greentechinnovators.backend.dto.ai.RecommendationResponse;
import com.greentechinnovators.backend.service.*;
import com.greentechinnovators.backend.service.RagService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final ChatService aiService;
    private final PredictionService generatePredictions;
    private final RecommendationService recommendationService;
    private final AiAlertService aiAlertService;

    private final RagService ragService;

    @PostMapping("/ingest")
    public String ingestData() {
        ragService.loadDataToVectorStore();
        return "✅ Données chargées dans le Vector Store avec succès !";
    }

    @GetMapping("/search")
    public List<String> testSearch(@RequestParam(defaultValue = "test") String query) {
        return ragService.searchSimilarData(query).stream()
                .map(Document::getContent)
                .toList();
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