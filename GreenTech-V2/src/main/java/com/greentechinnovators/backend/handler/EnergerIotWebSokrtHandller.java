package com.greentechinnovators.backend.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greentechinnovators.backend.dto.Energy.Request.EnergyRequestDTO;
import com.greentechinnovators.backend.dto.Energy.Responce.EnergyResponseDTO;
import com.greentechinnovators.backend.service.EnergyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class EnergerIotWebSokrtHandller extends TextWebSocketHandler {

    private final EnergyService energyService;
    private final ObjectMapper objectMapper;
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.put(session.getId(), session);
        log.info("Energy IoT WebSocket connected: {}", session.getId());
        
        // Send welcome message
        session.sendMessage(new TextMessage("{\"status\":\"connected\",\"message\":\"Energy IoT WebSocket connected\"}"));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            String payload = message.getPayload();
            log.info("Received energy data from {}: {}", session.getId(), payload);

            // Parse incoming JSON
            EnergyRequestDTO energyDTO = objectMapper.readValue(payload, EnergyRequestDTO.class);

            // Validate and save energy reading
            EnergyResponseDTO savedEnergy = energyService.createReading(energyDTO);

            // Send acknowledgment back to ESP32
            String ackMessage = objectMapper.writeValueAsString(Map.of(
                "status", "ok",
                "message", "Energy data saved successfully",
                "id", savedEnergy.getId(),
                "energyConsumed", savedEnergy.getEnergyConsumed()
            ));
            session.sendMessage(new TextMessage(ackMessage));

            // Broadcast to all connected clients (dashboard, mobile app, etc.)
            broadcastEnergyUpdate(savedEnergy);

        } catch (Exception e) {
            log.error("Error processing energy data: {}", e.getMessage(), e);
            String errorMessage = objectMapper.writeValueAsString(Map.of(
                "status", "error",
                "message", "Failed to process energy data: " + e.getMessage()
            ));
            session.sendMessage(new TextMessage(errorMessage));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session.getId());
        log.info("Energy IoT WebSocket disconnected: {} with status: {}", session.getId(), status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("Energy IoT WebSocket error for session {}: {}", session.getId(), exception.getMessage());
        sessions.remove(session.getId());
    }

    /**
     * Broadcast energy updates to all connected clients
     */
    private void broadcastEnergyUpdate(EnergyResponseDTO energyData) {
        String message;
        try {
            message = objectMapper.writeValueAsString(Map.of(
                "type", "ENERGY_UPDATE",
                "data", energyData
            ));
        } catch (Exception e) {
            log.error("Error serializing energy update: {}", e.getMessage());
            return;
        }

        sessions.values().forEach(session -> {
            try {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(message));
                }
            } catch (IOException e) {
                log.error("Error broadcasting to session {}: {}", session.getId(), e.getMessage());
            }
        });
    }


    


}
