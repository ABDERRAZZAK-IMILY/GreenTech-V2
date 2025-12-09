package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.NotificationDto;
import com.greentechinnovators.backend.dto.SmartDataDto;
import com.greentechinnovators.backend.service.NotificationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

 
    @GetMapping("/test/sensor")
    public String testSensorAlert() {
        SmartDataDto testData = new SmartDataDto();
        testData.setDataType("ENERGY");
        testData.setValue(150.0);
        testData.setUnit("kWh");
        testData.setLocation("production");
        testData.setSensorId("ESP32-ELEC-TEST");
        testData.setStatus("HIGH_CONSUMPTION");

        notificationService.sendSensorAlert(testData, "+50% vs moyenne");
        
        return " Sensor alert sent!";
    }


    @GetMapping("/test/marketplace")
    public String testMarketplaceNotification() {
        notificationService.sendMarketplaceUpdate(
            "Moustir Mouhamed",
            "cup de coffee",
            "APPROVED"
        );
        
        return " Marketplace notification sent!";
    }


    @GetMapping("/test/system")
    public String testSystemNotification() {
        notificationService.sendSystemNotification(
            "Mise à jour système",
            "Le système a été mis à jour avec succès",
            "success"
        );
        
        return " System notification sent!";
    }


    @PostMapping("/send")
    public String sendCustomNotification(@RequestBody NotificationDto notification) {
        notificationService.broadcast(notification);
        return " Custom notification sent!";
    }


    @GetMapping("/sessions")
    public String getActiveSessions() {
        int count = NotificationService.sessions.size();
        return String.format(" Active notification sessions: %d", count);
    }
}
