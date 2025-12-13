package com.greentechinnovators.backend.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greentechinnovators.backend.dto.vehicle.request.VehicleLogRequestDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.VehicleLogResponseDTO;
import com.greentechinnovators.backend.service.VehicleLogservice;
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
public class VehicleIotWebSocketHandler extends TextWebSocketHandler {

    private final VehicleLogservice vehicleLogservice;
    private final ObjectMapper objectMapper;
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.put(session.getId(), session);
        log.info("Vehicle IoT WebSocket connected: {}", session.getId());
        
        // Send welcome message only if session is open
        try {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage("{\"status\":\"connected\",\"message\":\"Vehicle IoT WebSocket connected\"}"));
            }
        } catch (Exception e) {
            log.warn("Failed to send welcome message to session {}: {}", session.getId(), e.getMessage());
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            String payload = message.getPayload();
            log.info("Received vehicle data from {}: {}", session.getId(), payload);

            // Parse incoming JSON
            VehicleLogRequestDTO vehicleDTO = objectMapper.readValue(payload, VehicleLogRequestDTO.class);

            // Save vehicle log
            VehicleLogResponseDTO savedLog = vehicleLogservice.create(vehicleDTO);

            // Send acknowledgment back
            String ackMessage = objectMapper.writeValueAsString(Map.of(
                "status", "ok",
                "message", "Vehicle data saved successfully",
                "id", savedLog.getId()
            ));
            session.sendMessage(new TextMessage(ackMessage));

            // Broadcast to all connected clients (dashboard, mobile app, etc.)
            broadcastVehicleUpdate(savedLog);

        } catch (Exception e) {
            log.error("Error processing vehicle data: {}", e.getMessage(), e);
            String errorMessage = objectMapper.writeValueAsString(Map.of(
                "status", "error",
                "message", "Failed to process vehicle data: " + e.getMessage()
            ));
            session.sendMessage(new TextMessage(errorMessage));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session.getId());
        log.info("Vehicle IoT WebSocket disconnected: {} with status: {}", session.getId(), status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("Vehicle IoT WebSocket error for session {}: {}", session.getId(), exception.getMessage());
        sessions.remove(session.getId());
    }

    /**
     * Broadcast vehicle updates to all connected clients
     */
    private void broadcastVehicleUpdate(VehicleLogResponseDTO vehicleData) {
        String message;
        try {
            message = objectMapper.writeValueAsString(Map.of(
                "type", "VEHICLE_UPDATE",
                "data", vehicleData
            ));
        } catch (Exception e) {
            log.error("Error serializing vehicle update: {}", e.getMessage());
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
