package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.AISummaryDTO;
import com.greentechinnovators.backend.service.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class AiController {

    private final AIService aiService;

    public AiController(AIService aiService) {
        this.aiService = aiService;
    }


    @PostMapping
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, Object> payload) {
        String userMessage = (String) payload.get("message");

        List<Map<String, String>> history = (List<Map<String, String>>) payload.get("history");

        String aiResponse = aiService.askAI(userMessage, history);

        return ResponseEntity.ok(Map.of("response", aiResponse));
    }

    @GetMapping("/stats")
    public ResponseEntity<AISummaryDTO> getAIStats() {
        return ResponseEntity.ok(aiService.generateDashboardStats());
    }
}
