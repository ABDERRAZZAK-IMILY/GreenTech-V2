package com.greentechinnovators.backend.handler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.greentechinnovators.backend.dto.Energy.Request.EnergyRequestDTO;
import com.greentechinnovators.backend.dto.Energy.Responce.EnergyResponseDTO;
import com.greentechinnovators.backend.service.EnergyService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class WSEnergyHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;
    private final EnergyService energyService;
    private final Validator validator;
    // private final EnergyMapper energyMapper; // Not strictly needed if Service returns ResponseDTO

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        try {
            // 1. Parse generic JSON tree to inspect the "action"
            JsonNode rootNode = objectMapper.readTree(message.getPayload());

            if (!rootNode.has("action")) {
                sendError(session, "MISSING_ACTION", "Please specify an 'action' field");
                return;
            }

            String action = rootNode.get("action").asText();

            // 2. Route based on Action
            switch (action) {
                case "ADD_ENERGY":
                    handleAddEnergy(session, rootNode.get("payload"));
                    break;
                case "GET_ALL":
                    handleGetAll(session);
                    break;
                default:
                    sendError(session, "INVALID_ACTION", "Unknown action: " + action);
            }

        } catch (Exception e) {
            log.error("WebSocket Error", e);
            sendError(session, "SERVER_ERROR", e.getMessage());
        }
    }

    // --- Action Methods ---

    private void handleAddEnergy(WebSocketSession session, JsonNode payloadNode) throws IOException {
        if (payloadNode == null) {
            sendError(session, "BAD_REQUEST", "Payload is missing");
            return;
        }

        // Convert specific payload to DTO
        EnergyRequestDTO requestDTO = objectMapper.treeToValue(payloadNode, EnergyRequestDTO.class);

        // Validate
        Set<ConstraintViolation<EnergyRequestDTO>> violations = validator.validate(requestDTO);
        if (!violations.isEmpty()) {
            String errorMsg = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.joining(", "));
            sendError(session, "VALIDATION_ERROR", errorMsg);
            return;
        }

        // Call Service
        EnergyResponseDTO responseDTO = energyService.createReading(requestDTO);

        // Send Success Response
        sendResponse(session, "ENERGY_ADDED", responseDTO);
    }

    private void handleGetAll(WebSocketSession session) throws IOException {
        // Call Service
        // Assuming your service has a method like: List<EnergyResponseDTO> getAllReadings();
        List<EnergyResponseDTO> list = energyService.getAllReadings();

        // Send List Response
        sendResponse(session, "ALL_ENERGY_DATA", list);
    }

    // --- Helper Methods ---

    private void sendResponse(WebSocketSession session, String type, Object data) throws IOException {
        // Wraps the response in a consistent structure: { "type": "...", "data": ... }
        if (session.isOpen()) {
            String json = objectMapper.writeValueAsString(new WebSocketResponse(type, data));
            session.sendMessage(new TextMessage(json));
        }
    }

    private void sendError(WebSocketSession session, String errorType, String message) throws IOException {
        if (session.isOpen()) {
            String json = objectMapper.writeValueAsString(new WebSocketResponse(errorType, message));
            session.sendMessage(new TextMessage(json));
        }
    }

    // Simple inner class for response structure
    record WebSocketResponse(String type, Object data) {
    }
}