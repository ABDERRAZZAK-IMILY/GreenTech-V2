package com.greentechinnovators.backend.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greentechinnovators.backend.dto.trash.request.TrashRequestDTO;
import com.greentechinnovators.backend.dto.trash.response.TrashResponseDTO;
import com.greentechinnovators.backend.service.TrashService;
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
public class TrashIotWebsocketHandeller extends TextWebSocketHandler {

    private final TrashService trashService;
    private final ObjectMapper objectMapper;
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.put(session.getId(), session);
        log.info("Trash IoT WebSocket connected: {}", session.getId());
        
        // Send welcome message only if session is open
        try {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage("{\"status\":\"connected\",\"message\":\"Trash IoT WebSocket connected\"}"));
            }
        } catch (Exception e) {
            log.warn("Failed to send welcome message to session {}: {}", session.getId(), e.getMessage());
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            String payload = message.getPayload();
            log.info("Received trash data from {}: {}", session.getId(), payload);

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
            TrashRequestDTO trashDTO = objectMapper.readValue(jsonPayload, TrashRequestDTO.class);

            // Validate and save trash reading
            TrashResponseDTO savedTrash = trashService.saveReading(trashDTO);

            // Send acknowledgment back to ESP32
            String ackMessage = objectMapper.writeValueAsString(Map.of(
                "status", "ok",
                "message", "Trash data saved successfully",
                "id", savedTrash.getId(),
                "weight", savedTrash.getWeight()
            ));
            session.sendMessage(new TextMessage(ackMessage));

            // Broadcast to all connected clients (dashboard, mobile app, etc.)
            broadcastTrashUpdate(savedTrash);

        } catch (Exception e) {
            log.error("Error processing trash data: {}", e.getMessage(), e);
            String errorMessage = objectMapper.writeValueAsString(Map.of(
                "status", "error",
                "message", "Failed to process trash data: " + e.getMessage()
            ));
            session.sendMessage(new TextMessage(errorMessage));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session.getId());
        log.info("Trash IoT WebSocket disconnected: {} with status: {}", session.getId(), status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("Trash IoT WebSocket error for session {}: {}", session.getId(), exception.getMessage());
        sessions.remove(session.getId());
    }

    /**
     * Broadcast trash updates to all connected clients
     */
    private void broadcastTrashUpdate(TrashResponseDTO trashData) {
        String message;
        try {
            message = objectMapper.writeValueAsString(Map.of(
                "type", "TRASH_UPDATE",
                "data", trashData
            ));
        } catch (Exception e) {
            log.error("Error serializing trash update: {}", e.getMessage());
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
