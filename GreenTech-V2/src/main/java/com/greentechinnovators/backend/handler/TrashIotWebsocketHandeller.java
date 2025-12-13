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

            // Parse incoming JSON
            TrashRequestDTO trashDTO = objectMapper.readValue(payload, TrashRequestDTO.class);

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



}
