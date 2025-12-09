package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.service.AIService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final AIService aiService;

    public ChatController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping
    public Map<String, String> chat(@RequestBody Map<String, String> payload) {
        String userMessage = payload.get("message");
        String aiResponse = aiService.askAI(userMessage);
        return Map.of("response", aiResponse);
    }
}