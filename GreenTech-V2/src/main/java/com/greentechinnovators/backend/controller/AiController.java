package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.AI.PredictionResponse;
import com.greentechinnovators.backend.dto.vehicle.responce.DailyDistanceDTO;
import com.greentechinnovators.backend.service.ChatService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final ChatService aiService;

    public AiController(ChatService aiService) {
        this.aiService = aiService;
    }


    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chatStream(@RequestBody Map<String, Object> payload) {
        String userMessage = (String) payload.get("message");
        List<Map<String, String>> history = (List<Map<String, String>>) payload.get("history");

        return aiService.askAIStream(userMessage, history);
    }

//    @GetMapping("/predictions")
//    public PredictionResponse getPredictions() {
//        return aiService.generatePredictions();
//    }

//        @GetMapping("/test")
//    public  List<DailyDistanceDTO> getPredictions() {
//        return aiService.test();
//    }
}
