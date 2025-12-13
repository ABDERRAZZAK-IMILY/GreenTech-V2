package com.greentechinnovators.backend.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greentechinnovators.backend.dto.gas.request.GasRequestDTO;
import com.greentechinnovators.backend.dto.gas.responce.GasResponseDTO;
import com.greentechinnovators.backend.service.GasService;
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
public class GasIotWebSocketHandler extends TextWebSocketHandler {

    private final GasService gasService;
    private final ObjectMapper objectMapper;
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.put(session.getId(), session);
        log.info("Gas IoT WebSocket connected: {}", session.getId());
        
        // Send welcome message only if session is open
        try {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage("{\"status\":\"connected\",\"message\":\"Gas IoT WebSocket connected\"}"));
            }
        } catch (Exception e) {
            log.warn("Failed to send welcome message to session {}: {}", session.getId(), e.getMessage());
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            String payload = message.getPayload();
            log.info("Received gas data from {}: {}", session.getId(), payload);

            // Parse incoming JSON
            GasRequestDTO gasDTO = objectMapper.readValue(payload, GasRequestDTO.class);

            // Validate and save gas reading
            // You'll need to create a method in GasService similar to EnergyService.createReading
            // For now, we'll just acknowledge
            
            // Broadcast to all connected clients (dashboard, mobile app, etc.)
            broadcastGasUpdate(gasDTO);

            // Send acknowledgment back
            String ackMessage = objectMapper.writeValueAsString(Map.of(
                "status", "ok",
                "message", "Gas data saved successfully"
            ));
            session.sendMessage(new TextMessage(ackMessage));

        } catch (Exception e) {
            log.error("Error processing gas data: {}", e.getMessage(), e);
            String errorMessage = objectMapper.writeValueAsString(Map.of(
                "status", "error",
                "message", "Failed to process gas data: " + e.getMessage()
            ));
            session.sendMessage(new TextMessage(errorMessage));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session.getId());
        log.info("Gas IoT WebSocket disconnected: {} with status: {}", session.getId(), status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("Gas IoT WebSocket error for session {}: {}", session.getId(), exception.getMessage());
        sessions.remove(session.getId());
    }

    /**
     * Broadcast gas updates to all connected clients
     */
    private void broadcastGasUpdate(GasRequestDTO gasData) {
        String message;
        try {
            message = objectMapper.writeValueAsString(Map.of(
                "type", "GAS_UPDATE",
                "data", gasData
            ));
        } catch (Exception e) {
            log.error("Error serializing gas update: {}", e.getMessage());
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
