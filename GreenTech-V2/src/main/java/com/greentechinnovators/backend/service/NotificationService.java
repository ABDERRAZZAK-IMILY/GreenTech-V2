package com.greentechinnovators.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greentechinnovators.backend.dto.NotificationDto;
import com.greentechinnovators.backend.dto.SmartDataDto;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationService {

    private final ObjectMapper objectMapper;
    public static final CopyOnWriteArrayList<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    public NotificationService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void broadcast(NotificationDto notification) {
        try {
            if (notification.getTimestamp() == null) {
                notification.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));
            }
            
            String jsonMessage = objectMapper.writeValueAsString(notification);
            TextMessage message = new TextMessage(jsonMessage);

            for (WebSocketSession session : sessions) {
                if (session.isOpen()) {
                    session.sendMessage(message);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void sendSensorAlert(SmartDataDto data, String issueDescription) {
        String severity = "warning";

        if ("HIGH_CONSUMPTION".equals(data.getStatus()) || "CRITICAL".equals(data.getStatus())) {
            severity = "critical";
        } else if ("OFFLINE".equals(data.getStatus())) {
            severity = "offline";
        } else if ("FULL_BIN".equals(data.getStatus())) {
            severity = "warning";
        }

        NotificationDto notification = NotificationDto.builder()
                .category("SENSOR")
                .severity(severity)
                .title(getAlertTitle(data))
                .message(issueDescription)
                .payload(data)
                .build();

        broadcast(notification);
    }

    public void sendMarketplaceUpdate(String userName, String productName, String status) {
        String severity = "info";
        String msg = "";

        if ("APPROVED".equals(status)) {
            severity = "success";
            msg = String.format("Demande de %s pour '%s' approuvée !", userName, productName);
        } else if ("REJECTED".equals(status)) {
            severity = "error";
            msg = String.format("Demande de %s pour '%s' refusée.", userName, productName);
        } else if ("PENDING".equals(status)) {
            severity = "info";
            msg = String.format("Nouvelle demande de %s pour '%s'", userName, productName);
        }

        NotificationDto notification = NotificationDto.builder()
                .category("MARKETPLACE")
                .severity(severity) // success, error, warning, info
                .message(msg)
                .title("Marketplace")
                .build();

        broadcast(notification);
    }

    public void sendSystemNotification(String title, String message, String severity) {
        NotificationDto notification = NotificationDto.builder()
                .category("SYSTEM")
                .severity(severity)
                .title(title)
                .message(message)
                .build();

        broadcast(notification);
    }

    private String getAlertTitle(SmartDataDto data) {
        if ("ENERGY".equals(data.getDataType())) {
            return "Consommation critique - " + data.getLocation();
        }
        if ("WASTE".equals(data.getDataType())) {
            return "Seuil déchets dépassé - " + data.getLocation();
        }
        if ("GAS".equals(data.getDataType())) {
            return "Alerte gaz - " + data.getLocation();
        }
        if ("TRANSPORT".equals(data.getDataType())) {
            return "Alerte transport - " + data.getSensorId();
        }
        return "Alerte Capteur - " + data.getLocation();
    }

    public void checkAndAlert(SmartDataDto data) {
        String issue = null;
        
        if ("ENERGY".equals(data.getDataType()) && data.getValue() > 100) {
            issue = String.format("+%.0f%% vs moyenne", ((data.getValue() - 100) / 100) * 100);
        } else if ("WASTE".equals(data.getDataType()) && data.getValue() > 50) {
            issue = String.format("Capacité: %.0f%%", (data.getValue() / 80) * 100);
        } else if ("GAS".equals(data.getDataType()) && data.getValue() > 10) {
            issue = "Consommation anormale détectée";
        }

        if (issue != null) {
            sendSensorAlert(data, issue);
        }
    }
}
