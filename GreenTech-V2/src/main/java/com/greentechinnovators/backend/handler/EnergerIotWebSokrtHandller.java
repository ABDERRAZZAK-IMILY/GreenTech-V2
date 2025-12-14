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
        
        // Send welcome message only if session is open
        try {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage("{\"status\":\"connected\",\"message\":\"Energy IoT WebSocket connected\"}"));
            }
        } catch (Exception e) {
            log.warn("Failed to send welcome message to session {}: {}", session.getId(), e.getMessage());
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            String payload = message.getPayload();
            log.info("Received energy data from {}: {}", session.getId(), payload);

            // Skip STOMP control frames (CONNECT, SUBSCRIBE, UNSUBSCRIBE, DISCONNECT, etc.)
            if (isStompControlFrame(payload)) {
                log.debug("Skipping STOMP control frame");
                handleStompControlFrame(session, payload);
                return;
            }

            // Extract JSON body from STOMP frame if present
            String jsonPayload = extractJsonFromStompFrame(payload);
            
            // Skip if no valid JSON found
            if (jsonPayload == null || jsonPayload.trim().isEmpty()) {
                log.debug("No JSON payload found, skipping");
                return;
            }
            
            log.debug("Extracted JSON payload: {}", jsonPayload);

            // Parse incoming JSON
            EnergyRequestDTO energyDTO = objectMapper.readValue(jsonPayload, EnergyRequestDTO.class);

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

    /**
     * Extract JSON body from STOMP frame format.
     * STOMP frames have the format:
     * COMMAND
     * header1:value1
     * header2:value2
     * 
     * {json body}
     * 
     * This method extracts just the JSON body if the message is in STOMP format,
     * or returns the original payload if it's already plain JSON.
     */
    private String extractJsonFromStompFrame(String payload) {
        if (payload == null || payload.isEmpty()) {
            return payload;
        }
        
        // Check if this looks like a STOMP frame (starts with a command like SEND, MESSAGE, etc.)
        String trimmedPayload = payload.trim();
        if (trimmedPayload.startsWith("{") || trimmedPayload.startsWith("[")) {
            // Already JSON format, return as-is
            return trimmedPayload;
        }
        
        // Try to find JSON object or array in the payload
        int jsonStart = payload.indexOf('{');
        int arrayStart = payload.indexOf('[');
        
        // Find the earliest JSON start
        int start = -1;
        if (jsonStart >= 0 && arrayStart >= 0) {
            start = Math.min(jsonStart, arrayStart);
        } else if (jsonStart >= 0) {
            start = jsonStart;
        } else if (arrayStart >= 0) {
            start = arrayStart;
        }
        
        if (start >= 0) {
            // Extract from JSON start to end, removing any trailing null characters
            String jsonPart = payload.substring(start).trim();
            // Remove STOMP null terminator if present (character \u0000)
            int nullIndex = jsonPart.indexOf('\u0000');
            if (nullIndex >= 0) {
                jsonPart = jsonPart.substring(0, nullIndex);
            }
            return jsonPart.trim();
        }
        
        // No JSON found, return null to skip processing
        return null;
    }

    /**
     * Check if the payload is a STOMP control frame (not data)
     */
    private boolean isStompControlFrame(String payload) {
        if (payload == null || payload.isEmpty()) {
            return false;
        }
        String trimmed = payload.trim();
        return trimmed.startsWith("CONNECT") ||
               trimmed.startsWith("STOMP") ||
               trimmed.startsWith("SUBSCRIBE") ||
               trimmed.startsWith("UNSUBSCRIBE") ||
               trimmed.startsWith("DISCONNECT") ||
               trimmed.startsWith("ACK") ||
               trimmed.startsWith("NACK") ||
               trimmed.startsWith("BEGIN") ||
               trimmed.startsWith("COMMIT") ||
               trimmed.startsWith("ABORT");
    }

    /**
     * Handle STOMP control frames by sending appropriate responses
     */
    private void handleStompControlFrame(WebSocketSession session, String payload) {
        try {
            String trimmed = payload.trim();
            if (trimmed.startsWith("CONNECT") || trimmed.startsWith("STOMP")) {
                // Send CONNECTED response for STOMP handshake
                String connectedFrame = "CONNECTED\nversion:1.2\nheart-beat:0,0\n\n\u0000";
                session.sendMessage(new TextMessage(connectedFrame));
                log.info("Sent STOMP CONNECTED response to session {}", session.getId());
            }
        } catch (Exception e) {
            log.error("Error handling STOMP control frame: {}", e.getMessage());
        }
    }


    


}
