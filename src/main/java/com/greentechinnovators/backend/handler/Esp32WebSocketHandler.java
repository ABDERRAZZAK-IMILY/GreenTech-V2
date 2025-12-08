package com.greentechinnovators.backend.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greentechinnovators.backend.dto.SmartDataDto;
import com.greentechinnovators.backend.service.SmartDataService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class Esp32WebSocketHandler extends TextWebSocketHandler {

    private final SmartDataService smartDataService;
    private final ObjectMapper objectMapper;

    public Esp32WebSocketHandler(SmartDataService smartDataService, ObjectMapper objectMapper) {
        this.smartDataService = smartDataService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        System.out.println("Received form ESP32: " + payload);

        SmartDataDto dataDto = objectMapper.readValue(payload, SmartDataDto.class);

        smartDataService.saveReading(dataDto);
    }
}