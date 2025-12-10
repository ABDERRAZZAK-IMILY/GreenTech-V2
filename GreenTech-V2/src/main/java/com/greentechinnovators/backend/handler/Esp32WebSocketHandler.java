package com.greentechinnovators.backend.handler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.greentechinnovators.backend.dto.Energy.Request.EnergyRequestDTO;
import com.greentechinnovators.backend.dto.trash.request.TrashRequestDTO;
import com.greentechinnovators.backend.service.EnergyService;
import com.greentechinnovators.backend.service.TrashService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Slf4j
@Component
@RequiredArgsConstructor
public class Esp32WebSocketHandler extends TextWebSocketHandler {

    private final EnergyService energyService;
    private final TrashService trashService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {
        String payload = message.getPayload();
        log.info("Received WebSocket message: {}", payload);

        try {
            JsonNode jsonNode = objectMapper.readTree(payload);

            if (jsonNode.has("energyConsumed")) {
                Double value = jsonNode.get("energyConsumed").asDouble();
                EnergyRequestDTO dto = EnergyRequestDTO.builder()
                        .energyConsumed(value)
                        .build();
                energyService.createReading(dto);
                log.info("Saved Energy reading via WebSocket: {}", value);
            }
            else if (jsonNode.has("weight")) {
                Double value = jsonNode.get("weight").asDouble();
                TrashRequestDTO dto = TrashRequestDTO.builder()
                        .weight(value)
                        .build();
                trashService.saveReading(dto);
                log.info("Saved Trash reading via WebSocket: {}", value);
            }
            else {
                log.warn("Unknown data format received: {}", payload);
            }

        } catch (Exception e) {
            log.error("Error processing WebSocket message", e);
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        log.info("New WebSocket connection established: {}", session.getId());
    }
}