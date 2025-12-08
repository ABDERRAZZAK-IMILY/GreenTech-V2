package com.greentechinnovators.backend.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greentechinnovators.backend.dto.SmartDataDto;
import com.greentechinnovators.backend.service.SmartDataService;
import com.greentechinnovators.backend.service.NotificationService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class Esp32WebSocketHandler extends TextWebSocketHandler {

    private final SmartDataService smartDataService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    public Esp32WebSocketHandler(SmartDataService smartDataService, 
                                NotificationService notificationService,
                                ObjectMapper objectMapper) {
        this.smartDataService = smartDataService;
        this.notificationService = notificationService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();

        SmartDataDto dataDto = objectMapper.readValue(payload, SmartDataDto.class);

        SmartDataDto savedData = smartDataService.saveReading(dataDto);
        
        notificationService.checkAndAlert(savedData);
    }
}