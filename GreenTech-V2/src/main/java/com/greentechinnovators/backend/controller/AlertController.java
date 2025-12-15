package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.service.SmsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alert")
public class AlertController {

    private final SmsService smsService;

    public AlertController(SmsService smsService) {
        this.smsService = smsService;
    }

    @PostMapping
    public String sendAlert(@RequestParam double co2) {
        if (co2 > 1000) {
            smsService.sendSms("+212659763229", "⚠️ CO2 élevé détecté !");
        }
        return "Check completed, SMS sent if needed";
    }
}
