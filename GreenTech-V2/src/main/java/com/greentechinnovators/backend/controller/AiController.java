package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.AI.PredictionResponse;
import com.greentechinnovators.backend.service.ChatService;
import com.greentechinnovators.backend.service.PredictionService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final ChatService aiService;
    private final PredictionService generatePredictions;

    public AiController(ChatService aiService, PredictionService generatePredictions) {
        this.aiService = aiService;
        this.generatePredictions = generatePredictions;
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

}
