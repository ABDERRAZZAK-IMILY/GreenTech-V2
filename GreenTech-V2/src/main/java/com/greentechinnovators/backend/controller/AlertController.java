package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.service.SmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alert")
@RequiredArgsConstructor
public class AlertController {

    private final SmsService smsService;


    @PostMapping
    public String sendAlert(@RequestParam double co2) {
        if (co2 > 1000) {
            smsService.sendSms("+212659763229", "⚠️ CO2 élevé détecté !");
        }
        return "Check completed, SMS sent if needed";
    }
}
